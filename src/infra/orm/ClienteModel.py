# Helen Oliveira

from src.infra.database import Base
from sqlalchemy import Column, Integer, VARCHAR, CHAR

class ClienteDB(Base):
    __tablename__ = "tb_cliente"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    nome = Column(VARCHAR(100), nullable=False)
    cpf = Column(CHAR(11), unique=True, nullable=False, index=True)
    telefone = Column(CHAR(11), nullable=False)

    def __init__(self, id, nome, cpf, telefone):
        self.id = id
        self.nome = nome
        self.cpf = cpf
        self.telefone = telefone