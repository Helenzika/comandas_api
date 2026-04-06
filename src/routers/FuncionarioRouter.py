# Helen Oliveira

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from copy import deepcopy

from src.domain.schemas.FuncionarioSchema import (
    FuncionarioCreate,
    FuncionarioUpdate,
    FuncionarioResponse
)
from src.domain.schemas.AuthSchema import FuncionarioAuth
from src.infra.orm.FuncionarioModel import FuncionarioDB
from src.infra.database import get_db
from src.infra.dependencies import require_group
from src.infra.security import get_password_hash
from src.infra.rate_limit import limiter, get_rate_limit
from src.services.AuditoriaService import AuditoriaService
from slowapi.errors import RateLimitExceeded

router = APIRouter()

@router.get("/funcionario/", response_model=List[FuncionarioResponse], tags=["Funcionário"], status_code=status.HTTP_200_OK, summary="Listar todos os funcionários - protegida por JWT e grupo 1")
@limiter.limit(get_rate_limit("moderate"))
async def get_funcionario(
    request: Request,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        return db.query(FuncionarioDB).all()
    except RateLimitExceeded:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar funcionários: {str(e)}")

@router.get("/funcionario/{id}", response_model=FuncionarioResponse, tags=["Funcionário"], status_code=status.HTTP_200_OK, summary="Listar funcionário por ID - protegida")
@limiter.limit(get_rate_limit("moderate"))
async def get_funcionario_por_id(
    request: Request,
    id: int,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group(None))
):
    try:
        funcionario = db.query(FuncionarioDB).filter(FuncionarioDB.id == id).first()
        if not funcionario:
            raise HTTPException(status_code=404, detail="Funcionário não encontrado")
        return funcionario
    except RateLimitExceeded:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar funcionário: {str(e)}")

@router.post("/funcionario/", response_model=FuncionarioResponse, status_code=status.HTTP_201_CREATED, tags=["Funcionário"], summary="Criar novo funcionário - protegida por JWT e grupo 1")
@limiter.limit(get_rate_limit("restrictive"))
async def post_funcionario(
    request: Request,
    funcionario_data: FuncionarioCreate,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        if funcionario_data.grupo not in [1, 2, 3]:
            raise HTTPException(status_code=400, detail="Grupo inválido. Apenas grupos 1, 2 ou 3 são permitidos.")

        existing_funcionario = db.query(FuncionarioDB).filter(FuncionarioDB.cpf == funcionario_data.cpf).first()
        if existing_funcionario:
            raise HTTPException(status_code=400, detail="Já existe um funcionário com este CPF")

        novo_funcionario = FuncionarioDB(
            id=None,
            nome=funcionario_data.nome,
            matricula=funcionario_data.matricula,
            cpf=funcionario_data.cpf,
            telefone=funcionario_data.telefone,
            grupo=funcionario_data.grupo,
            senha=get_password_hash(funcionario_data.senha)
        )

        db.add(novo_funcionario)
        db.commit()
        db.refresh(novo_funcionario)

        AuditoriaService.registrar_acao(
            db=db,
            funcionario_id=current_user.id,
            acao="CREATE",
            recurso="FUNCIONARIO",
            recurso_id=novo_funcionario.id,
            dados_antigos=None,
            dados_novos=novo_funcionario,
            request=request
        )

        return novo_funcionario

    except RateLimitExceeded:
        raise
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar funcionário: {str(e)}")

@router.put("/funcionario/{id}", response_model=FuncionarioResponse, tags=["Funcionário"], status_code=status.HTTP_200_OK, summary="Editar funcionário - protegida por JWT e grupo 1")
@limiter.limit(get_rate_limit("restrictive"))
async def put_funcionario(
    request: Request,
    id: int,
    funcionario_data: FuncionarioUpdate,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        funcionario = db.query(FuncionarioDB).filter(FuncionarioDB.id == id).first()
        if not funcionario:
            raise HTTPException(status_code=404, detail="Funcionário não encontrado")

        dados_antigos = deepcopy(funcionario)
        update_data = funcionario_data.model_dump(exclude_unset=True)

        if "senha" in update_data and update_data["senha"]:
            update_data["senha"] = get_password_hash(update_data["senha"])

        for field, value in update_data.items():
            setattr(funcionario, field, value)

        db.commit()
        db.refresh(funcionario)

        AuditoriaService.registrar_acao(
            db=db,
            funcionario_id=current_user.id,
            acao="UPDATE",
            recurso="FUNCIONARIO",
            recurso_id=funcionario.id,
            dados_antigos=dados_antigos,
            dados_novos=funcionario,
            request=request
        )

        return funcionario

    except RateLimitExceeded:
        raise
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar funcionário: {str(e)}")

@router.delete("/funcionario/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Funcionário"], summary="Remover funcionário - protegida por JWT e grupo 1")
@limiter.limit(get_rate_limit("critical"))
async def delete_funcionario(
    request: Request,
    id: int,
    db: Session = Depends(get_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        funcionario = db.query(FuncionarioDB).filter(FuncionarioDB.id == id).first()
        if not funcionario:
            raise HTTPException(status_code=404, detail="Funcionário não encontrado")

        if current_user.id == id:
            raise HTTPException(status_code=400, detail="Não é possível excluir seu próprio usuário")

        dados_antigos = deepcopy(funcionario)

        db.delete(funcionario)
        db.commit()

        AuditoriaService.registrar_acao(
            db=db,
            funcionario_id=current_user.id,
            acao="DELETE",
            recurso="FUNCIONARIO",
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
        raise HTTPException(status_code=500, detail=f"Erro ao deletar funcionário: {str(e)}")