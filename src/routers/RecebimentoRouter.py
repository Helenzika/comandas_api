# Helen Oliveira

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

from src.domain.schemas.RecebimentoSchema import (
    RecebimentoCreate,
    RecebimentoUpdate,
    RecebimentoResponse
)
from src.domain.schemas.AuthSchema import FuncionarioAuth
from src.infra.orm.RecebimentoModel import RecebimentoDB, ComandaRecebimentoDB
from src.infra.orm.ComandaModel import ComandaDB, ComandaProdutoDB
from src.infra.orm.FuncionarioModel import FuncionarioDB
from src.infra.database import get_async_db
from src.infra.dependencies import require_group
from src.infra.rate_limit import limiter, get_rate_limit

router = APIRouter()

@router.get(
    "/recebimento/",
    response_model=List[RecebimentoResponse],
    tags=["Recebimento"],
    summary="Listar recebimentos - grupo 1 e 3"
)
@limiter.limit(get_rate_limit("moderate"))
async def get_recebimentos(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    id: Optional[int] = Query(None),
    funcionario_id: Optional[int] = Query(None),
    data_inicio: Optional[datetime] = Query(None),
    data_fim: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_async_db),
    current_user: FuncionarioAuth = Depends(require_group([1, 3]))
):
    try:
        query = select(RecebimentoDB)

        if id is not None:
            query = query.where(RecebimentoDB.id == id)

        if funcionario_id is not None:
            query = query.where(RecebimentoDB.funcionario_id == funcionario_id)

        if data_inicio is not None:
            query = query.where(RecebimentoDB.data_hora >= data_inicio)

        if data_fim is not None:
            query = query.where(RecebimentoDB.data_hora <= data_fim)

        result = await db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar recebimentos: {str(e)}"
        )

@router.get(
    "/recebimento/{id}",
    response_model=RecebimentoResponse,
    tags=["Recebimento"],
    summary="Buscar recebimento por ID - grupo 1 e 3"
)
@limiter.limit(get_rate_limit("moderate"))
async def get_recebimento(
    id: int,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
    current_user: FuncionarioAuth = Depends(require_group([1, 3]))
):
    try:
        result = await db.execute(select(RecebimentoDB).where(RecebimentoDB.id == id))
        recebimento = result.scalar_one_or_none()

        if not recebimento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recebimento não encontrado"
            )

        return recebimento

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar recebimento: {str(e)}"
        )

@router.post(
    "/recebimento/",
    response_model=RecebimentoResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Recebimento"],
    summary="Criar recebimento - grupo 1 e 3"
)
@limiter.limit(get_rate_limit("restrictive"))
async def create_recebimento(
    recebimento_data: RecebimentoCreate,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
    current_user: FuncionarioAuth = Depends(require_group([1, 3]))
):
    try:
        result = await db.execute(
            select(FuncionarioDB).where(FuncionarioDB.id == recebimento_data.funcionario_id)
        )
        funcionario = result.scalar_one_or_none()

        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Funcionário não encontrado"
            )

        if not recebimento_data.comanda_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Informe pelo menos uma comanda"
            )

        valor_total_comandas = 0

        for comanda_id in recebimento_data.comanda_ids:
            result = await db.execute(
                select(ComandaDB).where(ComandaDB.id == comanda_id)
            )
            comanda = result.scalar_one_or_none()

            if not comanda:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Comanda {comanda_id} não encontrada"
                )

            if comanda.status != 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Comanda {comanda_id} não está aberta"
                )

            result_total = await db.execute(
                select(
                    func.coalesce(
                        func.sum(ComandaProdutoDB.quantidade * ComandaProdutoDB.valor_unitario),
                        0
                    )
                ).where(ComandaProdutoDB.comanda_id == comanda_id)
            )

            total_comanda = float(result_total.scalar() or 0)
            valor_total_comandas += total_comanda

        valor_final = valor_total_comandas + recebimento_data.valor_acrescimo - recebimento_data.valor_desconto

        if valor_final < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor total não pode ser negativo"
            )

        novo_recebimento = RecebimentoDB(
            funcionario_id=recebimento_data.funcionario_id,
            data_hora=datetime.now(),
            valor_acrescimo=recebimento_data.valor_acrescimo,
            valor_desconto=recebimento_data.valor_desconto,
            valor_total=valor_final
        )

        db.add(novo_recebimento)
        await db.commit()
        await db.refresh(novo_recebimento)

        for comanda_id in recebimento_data.comanda_ids:
            vinculo = ComandaRecebimentoDB(
                recebimento_id=novo_recebimento.id,
                comanda_id=comanda_id
            )
            db.add(vinculo)

            result = await db.execute(
                select(ComandaDB).where(ComandaDB.id == comanda_id)
            )
            comanda = result.scalar_one_or_none()

            if comanda:
                comanda.status = 1

        await db.commit()
        await db.refresh(novo_recebimento)

        return novo_recebimento

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar recebimento: {str(e)}"
        )

@router.put(
    "/recebimento/{id}",
    response_model=RecebimentoResponse,
    tags=["Recebimento"],
    summary="Editar recebimento - grupo 1"
)
@limiter.limit(get_rate_limit("restrictive"))
async def update_recebimento(
    id: int,
    recebimento_data: RecebimentoUpdate,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        result = await db.execute(select(RecebimentoDB).where(RecebimentoDB.id == id))
        recebimento = result.scalar_one_or_none()

        if not recebimento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recebimento não encontrado"
            )

        if recebimento_data.funcionario_id is not None:
            result = await db.execute(
                select(FuncionarioDB).where(FuncionarioDB.id == recebimento_data.funcionario_id)
            )
            funcionario = result.scalar_one_or_none()

            if not funcionario:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Funcionário não encontrado"
                )

            recebimento.funcionario_id = recebimento_data.funcionario_id

        if recebimento_data.valor_acrescimo is not None:
            recebimento.valor_acrescimo = recebimento_data.valor_acrescimo

        if recebimento_data.valor_desconto is not None:
            recebimento.valor_desconto = recebimento_data.valor_desconto

        if recebimento_data.valor_total is not None:
            recebimento.valor_total = recebimento_data.valor_total

        await db.commit()
        await db.refresh(recebimento)

        return recebimento

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao editar recebimento: {str(e)}"
        )

@router.delete(
    "/recebimento/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Recebimento"],
    summary="Excluir recebimento - grupo 1"
)
@limiter.limit(get_rate_limit("critical"))
async def delete_recebimento(
    id: int,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
    current_user: FuncionarioAuth = Depends(require_group([1]))
):
    try:
        result = await db.execute(select(RecebimentoDB).where(RecebimentoDB.id == id))
        recebimento = result.scalar_one_or_none()

        if not recebimento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recebimento não encontrado"
            )

        result_vinculos = await db.execute(
            select(ComandaRecebimentoDB).where(ComandaRecebimentoDB.recebimento_id == id)
        )
        vinculos = result_vinculos.scalars().all()

        for vinculo in vinculos:
            await db.delete(vinculo)

        await db.delete(recebimento)
        await db.commit()

        return None

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir recebimento: {str(e)}"
        )