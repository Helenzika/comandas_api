# Helen Oliveira

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
import uvicorn
from contextlib import asynccontextmanager

from src.settings import HOST, PORT, RELOAD, CORS_ORIGINS
from src.infra.rate_limit import limiter, rate_limit_exceeded_handler
from src.infra import database

from src.routers import AuditoriaRouter
from src.routers import AuthRouter
from src.routers import FuncionarioRouter
from src.routers import ClienteRouter
from src.routers import ProdutoRouter
from src.routers import ComandaRouter
from src.routers import RecebimentoRouter
from src.routers import HealthRouter

from src.infra.orm.FuncionarioModel import FuncionarioDB
from src.infra.orm.ClienteModel import ClienteDB
from src.infra.orm.ProdutoModel import ProdutoDB
from src.infra.orm.AuditoriaModel import AuditoriaDB
from src.infra.orm.ComandaModel import ComandaDB, ComandaProdutoDB
from src.infra.orm.RecebimentoModel import RecebimentoDB, ComandaRecebimentoDB

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("API has started")
    await database.cria_tabelas()
    yield
    print("API is shutting down")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False if "*" in CORS_ORIGINS else True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["*"],
    max_age=600,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

@app.get("/", tags=["Root"], status_code=200, summary="Informações da API - pública")
async def root():
    return {
        "detail": "API Comandas",
        "Swagger UI": "http://127.0.0.1:8000/docs",
        "ReDoc": "http://127.0.0.1:8000/redoc"
    }

app.include_router(AuditoriaRouter.router)
app.include_router(AuthRouter.router)
app.include_router(FuncionarioRouter.router)
app.include_router(ClienteRouter.router)
app.include_router(ProdutoRouter.router)
app.include_router(ComandaRouter.router)
app.include_router(RecebimentoRouter.router)
app.include_router(HealthRouter.router)

if __name__ == "__main__":
    uvicorn.run("src.main:app", host=HOST, port=int(PORT), reload=RELOAD)