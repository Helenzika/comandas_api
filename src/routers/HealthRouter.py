# Helen Oliveira

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text
from datetime import datetime, timezone
import psutil

from src.infra.database import get_db
from src.infra.orm.FuncionarioModel import FuncionarioDB
from src.infra.orm.ClienteModel import ClienteDB
from src.infra.orm.ProdutoModel import ProdutoDB

router = APIRouter()

@router.get("/health", tags=["Health"], summary="Health check básico")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "comandas-api",
        "version": "1.0.0"
    }

@router.get("/health/database", tags=["Health"], summary="Health check do banco")
async def database_health():
    try:
        db = next(get_db())
        result = db.execute(text("SELECT 1 as test")).fetchone()

        if result and result[0] == 1:
            return {
                "status": "healthy",
                "database": "connected",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database query failed"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database unavailable: {str(e)}"
        )
    finally:
        try:
            db.close()
        except Exception:
            pass

@router.get("/health/database/tables", tags=["Health"], summary="Health check das tabelas")
async def database_tables_health():
    try:
        db = next(get_db())

        checks = {}

        try:
            checks["funcionarios"] = {
                "status": "healthy",
                "count": db.query(FuncionarioDB).count()
            }
        except Exception as e:
            checks["funcionarios"] = {
                "status": "error",
                "error": str(e)
            }

        try:
            checks["clientes"] = {
                "status": "healthy",
                "count": db.query(ClienteDB).count()
            }
        except Exception as e:
            checks["clientes"] = {
                "status": "error",
                "error": str(e)
            }

        try:
            checks["produtos"] = {
                "status": "healthy",
                "count": db.query(ProdutoDB).count()
            }
        except Exception as e:
            checks["produtos"] = {
                "status": "error",
                "error": str(e)
            }

        all_healthy = all(check["status"] == "healthy" for check in checks.values())

        return {
            "status": "healthy" if all_healthy else "unhealthy",
            "tables": checks,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database tables check failed: {str(e)}"
        )
    finally:
        try:
            db.close()
        except Exception:
            pass

@router.get("/health/system", tags=["Health"], summary="Health check do sistema")
async def system_health():
    try:
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        cpu_percent = psutil.cpu_percent(interval=1)

        return {
            "status": "healthy",
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "used": memory.used
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            },
            "cpu": {
                "percent": cpu_percent
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"System check failed: {str(e)}"
        )

@router.get("/health/full", tags=["Health"], summary="Health check completo")
async def full_health():
    database_status = "healthy"
    system_status = "healthy"

    try:
        db = next(get_db())
        db.execute(text("SELECT 1 as test")).fetchone()
    except Exception:
        database_status = "unhealthy"
    finally:
        try:
            db.close()
        except Exception:
            pass

    try:
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        cpu = psutil.cpu_percent(interval=1)

        system_data = {
            "memory_percent": memory.percent,
            "disk_percent": disk.percent,
            "cpu_percent": cpu
        }

        if memory.percent > 90 or disk.percent > 90 or cpu > 95:
            system_status = "warning"

    except Exception:
        system_status = "unhealthy"
        system_data = {}

    overall_status = "healthy"

    if database_status != "healthy" or system_status == "unhealthy":
        overall_status = "unhealthy"
    elif system_status == "warning":
        overall_status = "warning"

    return {
        "status": overall_status,
        "database": database_status,
        "system": system_status,
        "system_data": system_data,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/ready", tags=["Health"], summary="Readiness check")
async def ready_check():
    try:
        db = next(get_db())
        db.execute(text("SELECT 1 as test")).fetchone()

        return {
            "status": "ready",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"API not ready: {str(e)}"
        )
    finally:
        try:
            db.close()
        except Exception:
            pass

@router.get("/live", tags=["Health"], summary="Liveness check")
async def live_check():
    return {
        "status": "alive",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }