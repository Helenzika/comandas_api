# Helen Oliveira

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta

from src.domain.schemas.AuthSchema import (
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    FuncionarioAuth
)
from src.infra.orm.FuncionarioModel import FuncionarioDB
from src.infra.database import get_db
from src.infra.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from src.infra.dependencies import get_current_active_user
from src.infra.rate_limit import limiter, get_rate_limit
from src.services.AuditoriaService import AuditoriaService
from src.settings import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from slowapi.errors import RateLimitExceeded

router = APIRouter()

@router.post("/auth/login", response_model=TokenResponse, tags=["Autenticação"], summary="Login de funcionário - pública")
@limiter.limit(get_rate_limit("critical"))
async def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    try:
        funcionario = db.query(FuncionarioDB).filter(FuncionarioDB.cpf == login_data.cpf).first()

        if not funcionario or not verify_password(login_data.senha, funcionario.senha):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="CPF ou senha inválidos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        access_token = create_access_token(
            data={"sub": funcionario.cpf, "id": funcionario.id, "grupo": funcionario.grupo},
            expires_delta=access_token_expires,
        )

        refresh_token = create_refresh_token(
            data={"sub": funcionario.cpf, "id": funcionario.id, "grupo": funcionario.grupo}
        )

        AuditoriaService.registrar_acao(
            db=db,
            funcionario_id=funcionario.id,
            acao="LOGIN",
            recurso="AUTH",
            recurso_id=funcionario.id,
            dados_antigos=None,
            dados_novos={"access_token": "gerado", "refresh_token": "gerado"},
            request=request
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            refresh_expires_in=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        )

    except RateLimitExceeded:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao realizar login: {str(e)}")

@router.post("/auth/refresh", response_model=TokenResponse, tags=["Autenticação"], summary="Refresh token - pública")
@limiter.limit(get_rate_limit("critical"))
async def refresh_token(request: Request, data: RefreshTokenRequest):
    payload = verify_refresh_token(data.refresh_token)

    cpf = payload.get("sub")
    id_funcionario = payload.get("id")
    grupo = payload.get("grupo")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    new_access_token = create_access_token(
        data={"sub": cpf, "id": id_funcionario, "grupo": grupo},
        expires_delta=access_token_expires,
    )

    new_refresh_token = create_refresh_token(
        data={"sub": cpf, "id": id_funcionario, "grupo": grupo}
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_expires_in=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

@router.get("/auth/me", response_model=FuncionarioAuth, tags=["Autenticação"], summary="Dados do usuário atual - protegida")
@limiter.limit(get_rate_limit("moderate"))
async def me(request: Request, current_user: FuncionarioAuth = Depends(get_current_active_user)):
    return current_user

@router.post("/auth/logout", tags=["Autenticação"], summary="Logout - pública")
@limiter.limit(get_rate_limit("critical"))
async def logout(request: Request):
    return {"msg": "Logout realizado com sucesso"}