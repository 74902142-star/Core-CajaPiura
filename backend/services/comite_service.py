from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import SolicitudCredito, ComiteDecision, Cliente
from datetime import datetime


async def evaluar_solicitud(db: AsyncSession, solicitud_id: int) -> dict:
    result = await db.execute(
        select(SolicitudCredito).where(SolicitudCredito.id == solicitud_id)
    )
    solicitud = result.scalar_one_or_none()

    if not solicitud:
        return {"error": "Solicitud no encontrada"}

    if solicitud.estado not in ["recibido_comite", "enviado"]:
        return {"error": f"No se puede evaluar. Estado actual: {solicitud.estado}"}

    solicitud.estado = "en_evaluacion"
    solicitud.updated_at = datetime.utcnow()
    await db.commit()

    return {
        "message": "Solicitud en evaluación",
        "solicitud_id": solicitud_id,
        "numero_expediente": solicitud.numero_expediente,
        "estado": "en_evaluacion",
    }


async def tomar_decision(db: AsyncSession, solicitud_id: int, decision: str, monto_aprobado: float = None, motivo: str = None, evaluador_id: int = None) -> dict:
    result = await db.execute(
        select(SolicitudCredito).where(SolicitudCredito.id == solicitud_id)
    )
    solicitud = result.scalar_one_or_none()

    if not solicitud:
        return {"error": "Solicitud no encontrada"}

    if decision not in ["aprobado", "rechazado", "condicionado"]:
        return {"error": "Decisión inválida"}

    solicitud.estado = decision
    solicitud.motivo_rechazo = motivo
    if monto_aprobado:
        solicitud.monto_aprobado = monto_aprobado
    solicitud.updated_at = datetime.utcnow()

    comite_decision = ComiteDecision(
        solicitud_id=solicitud_id,
        evaluador_id=evaluador_id,
        decision=decision,
        monto_aprobado=monto_aprobado,
        motivo=motivo,
    )
    db.add(comite_decision)
    await db.commit()

    return {
        "message": f"Solicitud {decision}",
        "solicitud_id": solicitud_id,
        "numero_expediente": solicitud.numero_expediente,
        "decision": decision,
        "monto_aprobado": monto_aprobado,
    }


async def get_solicitudes_pendientes(db: AsyncSession):
    result = await db.execute(
        select(SolicitudCredito, Cliente)
        .join(Cliente, SolicitudCredito.cliente_id == Cliente.id)
        .where(SolicitudCredito.estado == "recibido_comite")
        .order_by(SolicitudCredito.created_at.desc())
    )
    rows = result.all()
    solicitudes = []
    for sol, cliente in rows:
        solicitudes.append({
            "id": sol.id,
            "numero_expediente": sol.numero_expediente,
            "monto": sol.monto,
            "plazo": sol.plazo,
            "estado": sol.estado,
            "created_at": sol.created_at.isoformat() if sol.created_at else None,
            "cliente": {
                "nombre": cliente.nombre,
                "apellido": cliente.apellido,
                "dni": cliente.dni,
            }
        })
    return solicitudes
