# Helen Oliveira

from src.infra.database import SessionLocal, Base, engine
from src.infra.orm.FuncionarioModel import FuncionarioDB
from src.infra.orm.ClienteModel import ClienteDB
from src.infra.orm.ProdutoModel import ProdutoDB
from src.infra.security import get_password_hash

# garante criação das tabelas
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # limpa dados antigos se existirem
    db.query(FuncionarioDB).delete()
    db.query(ClienteDB).delete()
    db.query(ProdutoDB).delete()
    db.commit()

    # funcionários
    funcionarios = [
        FuncionarioDB(
            id=None,
            nome="Helen Oliveira Admin",
            matricula="ADM001",
            cpf="12345678901",
            telefone="49999999999",
            grupo=1,
            senha=get_password_hash("123456")
        ),
        FuncionarioDB(
            id=None,
            nome="Helen Oliveira Caixa",
            matricula="CX001",
            cpf="12345678902",
            telefone="49988888888",
            grupo=3,
            senha=get_password_hash("123456")
        ),
        FuncionarioDB(
            id=None,
            nome="Zé das Batatas",
            matricula="ZE001",
            cpf="12345678903",
            telefone="49977777777",
            grupo=1,
            senha=get_password_hash("123456")
        ),
    ]

    for funcionario in funcionarios:
        db.add(funcionario)

    # cliente
    cliente = ClienteDB(
        id=None,
        nome="Helen Oliveira",
        cpf="22345678901",
        telefone="49999999999"
    )
    db.add(cliente)

    # produtos
    produtos = [
        ProdutoDB(id=None, nome="Pastel 1", descricao="Pastel de carne", foto=b"helen", valor_unitario=10.0),
        ProdutoDB(id=None, nome="Pastel 2", descricao="Pastel de queijo", foto=b"helen", valor_unitario=11.0),
        ProdutoDB(id=None, nome="Pastel 3", descricao="Pastel de frango", foto=b"helen", valor_unitario=12.0),
        ProdutoDB(id=None, nome="Pastel 4", descricao="Pastel de pizza", foto=b"helen", valor_unitario=13.0),
        ProdutoDB(id=None, nome="Pastel 5", descricao="Pastel especial", foto=b"helen", valor_unitario=14.0),
        ProdutoDB(id=None, nome="Pastel 6", descricao="Pastel base para edição", foto=b"helen", valor_unitario=15.0),
    ]

    for produto in produtos:
        db.add(produto)

    db.commit()
    print("Banco populado com sucesso!")

finally:
    db.close()