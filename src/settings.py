# Helen Oliveira

from dotenv import load_dotenv, find_dotenv
import os

dotenv_file = find_dotenv()
load_dotenv(dotenv_file)

HOST = os.getenv("HOST", "0.0.0.0")
PORT = os.getenv("PORT", "8000")
RELOAD = os.getenv("RELOAD", "False").lower() == "true"

DB_SGDB = os.getenv("DB_SGDB", "sqlite")
DB_NAME = os.getenv("DB_NAME", "comandas_db")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_USER = os.getenv("DB_USER", "")
DB_PASS = os.getenv("DB_PASS", "")

if DB_SGDB == "sqlite":
    STR_DATABASE = f"sqlite:///{DB_NAME}.db"
    ASYNC_STR_DATABASE = f"sqlite+aiosqlite:///{DB_NAME}.db"

elif DB_SGDB == "mysql":
    STR_DATABASE = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}?charset=utf8mb4"
    ASYNC_STR_DATABASE = f"mysql+aiomysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}?charset=utf8mb4"

elif DB_SGDB == "postgresql":
    STR_DATABASE = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
    ASYNC_STR_DATABASE = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"

else:
    STR_DATABASE = "sqlite:///apiDatabase.db"
    ASYNC_STR_DATABASE = "sqlite+aiosqlite:///apiDatabase.db"

SECRET_KEY = os.getenv("SECRET_KEY", "chaveSuperSecretaHelen123456")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "240"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

RATE_LIMIT_CRITICAL = os.getenv("RATE_LIMIT_CRITICAL", "5/minute")
RATE_LIMIT_MODERATE = os.getenv("RATE_LIMIT_MODERATE", "100/minute")
RATE_LIMIT_RESTRICTIVE = os.getenv("RATE_LIMIT_RESTRICTIVE", "20/minute")
RATE_LIMIT_LOW = os.getenv("RATE_LIMIT_LOW", "200/minute")
RATE_LIMIT_LIGHT = os.getenv("RATE_LIMIT_LIGHT", "300/minute")
RATE_LIMIT_DEFAULT = os.getenv("RATE_LIMIT_DEFAULT", "50/minute")

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
).split(",")