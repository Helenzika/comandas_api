# Helen Oliveira

from src.infra.database import SessionLocal, Base, engine
from src.infra.orm.FuncionarioModel import FuncionarioDB
from src.infra.security import get_password_hash

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    admin = db.query(FuncionarioDB).filter(FuncionarioDB.cpf == "12345678901").first()

    if not admin:
        admin = FuncionarioDB(
            id=None,
            nome="Helen Oliveira Admin",
            matricula="ADM001",
            cpf="12345678901",
            telefone="49999999999",
            grupo=1,
            senha=get_password_hash("123456")
        )
        db.add(admin)

    ze = db.query(FuncionarioDB).filter(FuncionarioDB.cpf == "12345678903").first()

    if not ze:
        ze = FuncionarioDB(
            id=None,
            nome="Zé das Batatas",
            matricula="ZE001",
            cpf="12345678903",
            telefone="49977777777",
            grupo=1,
            senha=get_password_hash("123456")
        )
        db.add(ze)

    db.commit()
    print("Banco populado com sucesso!")

finally:
    db.close()