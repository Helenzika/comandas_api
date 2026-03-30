# Helen Oliveira

from fastapi import FastAPI
from src.settings import HOST, PORT, RELOAD
import uvicorn

from src.routers import FuncionarioRouter
from src.routers import ClienteRouter
from src.routers import ProdutoRouter
from src.routers import AuthRouter

from src.infra import database
from contextlib import asynccontextmanager

from src.infra.orm.FuncionarioModel import FuncionarioDB
from src.infra.orm.ClienteModel import ClienteDB
from src.infra.orm.ProdutoModel import ProdutoDB

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("API has started")
    await database.cria_tabelas()
    yield
    print("API is shutting down")

app = FastAPI(lifespan=lifespan)

@app.get("/", tags=["Root"], status_code=200)
async def root():
    return {
        "detail": "API Pastelaria",
        "Swagger UI": "http://127.0.0.1:8000/docs",
        "ReDoc": "http://127.0.0.1:8000/redoc"
    }

app.include_router(AuthRouter.router)
app.include_router(FuncionarioRouter.router)
app.include_router(ClienteRouter.router)
app.include_router(ProdutoRouter.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=int(PORT), reload=RELOAD)