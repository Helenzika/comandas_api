# Helen Oliveira

from src.infra.database import Base
from sqlalchemy import Column, Integer, VARCHAR, DECIMAL, BLOB

class ProdutoDB(Base):
    __tablename__ = "tb_produto"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    nome = Column(VARCHAR(100), nullable=False, index=True)
    descricao = Column(VARCHAR(200), nullable=False)
    foto = Column(BLOB, nullable=False)
    valor_unitario = Column(DECIMAL(11, 2), nullable=False)

    def __init__(self, id, nome, descricao, foto, valor_unitario):
        self.id = id
        self.nome = nome
        self.descricao = descricao
        self.foto = foto
        self.valor_unitario = valor_unitario