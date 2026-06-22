# Helen Oliveira

from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class RecebimentoCreate(BaseModel):
    funcionario_id: int
    comanda_ids: List[int]
    valor_acrescimo: float = 0
    valor_desconto: float = 0

class RecebimentoUpdate(BaseModel):
    funcionario_id: Optional[int] = None
    valor_acrescimo: Optional[float] = None
    valor_desconto: Optional[float] = None
    valor_total: Optional[float] = None

class RecebimentoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    funcionario_id: int
    data_hora: datetime
    valor_acrescimo: float
    valor_desconto: float
    valor_total: float

class ComandaRecebimentoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recebimento_id: int
    comanda_id: int