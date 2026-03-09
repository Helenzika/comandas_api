#Helen de Oliveira
from fastapi import FastAPI
from settings import HOST, PORT, RELOAD
import uvicorn
app = FastAPI()
if __name__ == "__main__":
    uvicorn.run('main:app', host=HOST, port=int(PORT), reload=RELOAD)

from fastapi import FastAPI
from settings import HOST, PORT, RELOAD
import uvicorn

from routers import FuncionarioRouter
from routers import ClienteRouter
from routers import ProdutoRouter
# rotas/endpoints
app.include_router(FuncionarioRouter.router)
app.include_router(ClienteRouter.router)
if __name__ == "__main__":
    uvicorn.run('main:app', host=HOST, port=int(PORT), reload=RELOAD)

app.include_router(FuncionarioRouter.router)
app.include_router(ClienteRouter.router)
app.include_router(ProdutoRouter.router)


