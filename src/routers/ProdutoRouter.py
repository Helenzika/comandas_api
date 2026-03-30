# Helen Oliveira

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from src.domain.schemas.ProdutoSchema import (
    ProdutoCreate,
    ProdutoUpdate,
    ProdutoResponse
)
from src.domain.schemas.AuthSchema import FuncionarioAuth
from src.infra.orm.ProdutoModel import ProdutoDB
from src.infra.database import get_db
from src.infra.dependencies import require_group

router = APIRouter()

# 🔓 resposta pública (sem id e sem valor)
class ProdutoPublicoResponse(BaseModel):
    nome: str
    descricao: str

# 🔓 rota pública
@router.get(
    "/produto/publico",
    response_model=List[ProdutoPublicoResponse],
    tags=["Produto"],
    status_code=status.HTTP_200_OK,
    summary="Listar produtos públicos sem id e sem valor"
)
async def get_produto_publico(db: Session = Depends(get_db)):
    try:
        produtos = db.query(ProdutoDB).all()

        return [
            {
                "nome": produto.nome,
                "descricao": produto.descricao
            }
            for produto in produtos
        ]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar produtos públicos: {str(e)}"
        )

# 🔒 listar todos (protegida)
@router.get(
    "/produto/",
    response_model=List[ProdutoResponse],
    tags=["Produto"],
    status_code=status.HTTP_200_OK
)
async def get_produto(
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group(None))
):
    try:
        return db.query(ProdutoDB).all()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar produtos: {str(e)}"
        )

# 🔒 listar por id (protegida)
@router.get(
    "/produto/{id}",
    response_model=ProdutoResponse,
    tags=["Produto"],
    status_code=status.HTTP_200_OK
)
async def get_produto_por_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group(None))
):
    try:
        produto = db.query(ProdutoDB).filter(ProdutoDB.id == id).first()

        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado"
            )

        return produto

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar produto: {str(e)}"
        )

# 🔒 criar (grupo 1)
@router.post(
    "/produto/",
    response_model=ProdutoResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Produto"]
)
async def post_produto(
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

        return novo_produto

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar produto: {str(e)}"
        )

# 🔒 editar (grupo 1)
@router.put(
    "/produto/{id}",
    response_model=ProdutoResponse,
    tags=["Produto"],
    status_code=status.HTTP_200_OK
)
async def put_produto(
    id: int,
    produto_data: ProdutoUpdate,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        produto = db.query(ProdutoDB).filter(ProdutoDB.id == id).first()

        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado"
            )

        update_data = produto_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(produto, field, value)

        db.commit()
        db.refresh(produto)

        return produto

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar produto: {str(e)}"
        )

# 🔒 deletar (grupo 1)
@router.delete(
    "/produto/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Produto"]
)
async def delete_produto(
    id: int,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        produto = db.query(ProdutoDB).filter(ProdutoDB.id == id).first()

        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado"
            )

        db.delete(produto)
        db.commit()

        return None

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar produto: {str(e)}"
        )