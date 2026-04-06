# Helen Oliveira

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from copy import deepcopy

from src.domain.schemas.ProdutoSchema import (
    ProdutoCreate,
    ProdutoUpdate,
    ProdutoResponse
)
from src.domain.schemas.AuthSchema import FuncionarioAuth
from src.infra.orm.ProdutoModel import ProdutoDB
from src.infra.database import get_db
from src.infra.dependencies import require_group
from src.infra.rate_limit import limiter, get_rate_limit
from src.services.AuditoriaService import AuditoriaService
from slowapi.errors import RateLimitExceeded

router = APIRouter()

class ProdutoPublicoResponse(BaseModel):
    nome: str
    descricao: str

@router.get("/produto/publico", response_model=List[ProdutoPublicoResponse], tags=["Produto"], status_code=status.HTTP_200_OK, summary="Listar produtos públicos sem id e sem valor")
@limiter.limit(get_rate_limit("light"))
async def get_produto_publico(request: Request, db: Session = Depends(get_db)):
    try:
        produtos = db.query(ProdutoDB).all()
        return [{"nome": produto.nome, "descricao": produto.descricao} for produto in produtos]
    except RateLimitExceeded:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar produtos públicos: {str(e)}")

@router.get("/produto/", response_model=List[ProdutoResponse], tags=["Produto"], status_code=status.HTTP_200_OK, summary="Listar produtos - protegida")
@limiter.limit(get_rate_limit("moderate"))
async def get_produto(
    request: Request,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group(None))
):
    try:
        return db.query(ProdutoDB).all()
    except RateLimitExceeded:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar produtos: {str(e)}")

@router.get("/produto/{id}", response_model=ProdutoResponse, tags=["Produto"], status_code=status.HTTP_200_OK, summary="Buscar produto por ID - protegida")
@limiter.limit(get_rate_limit("moderate"))
async def get_produto_por_id(
    request: Request,
    id: int,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group(None))
):
    try:
        produto = db.query(ProdutoDB).filter(ProdutoDB.id == id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        return produto
    except RateLimitExceeded:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar produto: {str(e)}")

@router.post("/produto/", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED, tags=["Produto"], summary="Criar produto - protegida por grupo 1")
@limiter.limit(get_rate_limit("restrictive"))
async def post_produto(
    request: Request,
    produto_data: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        novo_produto = ProdutoDB(
            id=None,
            nome=produto_data.nome,
            descricao=produto_data.descricao,
            foto=produto_data.foto,
            valor_unitario=produto_data.valor_unitario
        )

        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)

        AuditoriaService.registrar_acao(
            db=db,
            funcionario_id=current_user.id,
            acao="CREATE",
            recurso="PRODUTO",
            recurso_id=novo_produto.id,
            dados_antigos=None,
            dados_novos=novo_produto,
            request=request
        )

        return novo_produto

    except RateLimitExceeded:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar produto: {str(e)}")

@router.put("/produto/{id}", response_model=ProdutoResponse, tags=["Produto"], status_code=status.HTTP_200_OK, summary="Editar produto - protegida por grupo 1")
@limiter.limit(get_rate_limit("restrictive"))
async def put_produto(
    request: Request,
    id: int,
    produto_data: ProdutoUpdate,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        produto = db.query(ProdutoDB).filter(ProdutoDB.id == id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        dados_antigos = deepcopy(produto)
        update_data = produto_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(produto, field, value)

        db.commit()
        db.refresh(produto)

        AuditoriaService.registrar_acao(
            db=db,
            funcionario_id=current_user.id,
            acao="UPDATE",
            recurso="PRODUTO",
            recurso_id=produto.id,
            dados_antigos=dados_antigos,
            dados_novos=produto,
            request=request
        )

        return produto

    except RateLimitExceeded:
        raise
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar produto: {str(e)}")

@router.delete("/produto/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Produto"], summary="Excluir produto - protegida por grupo 1")
@limiter.limit(get_rate_limit("critical"))
async def delete_produto(
    request: Request,
    id: int,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        produto = db.query(ProdutoDB).filter(ProdutoDB.id == id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        dados_antigos = deepcopy(produto)

        db.delete(produto)
        db.commit()

        AuditoriaService.registrar_acao(
            db=db,
            funcionario_id=current_user.id,
            acao="DELETE",
            recurso="PRODUTO",
            recurso_id=id,
            dados_antigos=dados_antigos,
            dados_novos=None,
            request=request
        )

        return None

    except RateLimitExceeded:
        raise
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar produto: {str(e)}")