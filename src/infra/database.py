# Helen Oliveira

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from src.settings import STR_DATABASE

engine = create_engine(
    STR_DATABASE,
    echo=True,
    connect_args={"check_same_thread": False} if STR_DATABASE.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

async def cria_tabelas():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()