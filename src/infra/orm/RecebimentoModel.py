# Helen Oliveira

from sqlalchemy import Column, Integer, DateTime, DECIMAL, ForeignKey
from src.infra.database import Base

class RecebimentoDB(Base):
    __tablename__ = "tb_recebimento"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    funcionario_id = Column(Integer, ForeignKey("tb_funcionario.id", ondelete="RESTRICT"), nullable=False)
    data_hora = Column(DateTime, nullable=False)
    valor_acrescimo = Column(DECIMAL(11, 2), nullable=False, default=0)
    valor_desconto = Column(DECIMAL(11, 2), nullable=False, default=0)
    valor_total = Column(DECIMAL(11, 2), nullable=False)

class ComandaRecebimentoDB(Base):
    __tablename__ = "tb_comanda_recebimento"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    recebimento_id = Column(Integer, ForeignKey("tb_recebimento.id", ondelete="RESTRICT"), nullable=False)
    comanda_id = Column(Integer, ForeignKey("tb_comanda.id", ondelete="RESTRICT"), nullable=False)