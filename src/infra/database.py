# Helen Oliveira

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from src.settings import STR_DATABASE, ASYNC_STR_DATABASE

engine = create_engine(STR_DATABASE, echo=True)

async_engine = create_async_engine(ASYNC_STR_DATABASE, echo=True)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def cria_tabelas():
    Base.metadata.create_all(bind=engine)

def get_db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()