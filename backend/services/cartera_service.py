from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models import Cartera, Cliente, SolicitudCredito
from typing import List, Optional


async def get_cartera_oficial(db: AsyncSession, oficial_id: int) -> List[dict]:
    result = await db.execute(
        select(Cartera, Cliente)
        .join(Cliente, Cartera.cliente_id == Cliente.id)
        .where(Cartera.oficial_id == oficial_id)
        .order_by(Cartera.created_at.desc())
    )
    rows = result.all()
    carteras = []
    for cartera, cliente in rows:
        solicitudes_result = await db.execute(
            select(SolicitudCredito).where(SolicitudCredito.cliente_id == cliente.id)
        )
        solicitudes = solicitudes_result.scalars().all()
        carteras.append({
            "id": cartera.id,
            "oficial_id": cartera.oficial_id,
            "cliente_id": cartera.cliente_id,
            "cliente": {
                "id": cliente.id,
                "dni": cliente.dni,
                "nombre": cliente.nombre,
                "apellido": cliente.apellido,
                "telefono": cliente.telefono,
                "email": cliente.email,
                "direccion": cliente.direccion,
                "ingreso_mensual": cliente.ingreso_mensual,
                "gasto_mensual": cliente.gasto_mensual,
                "nombre_negocio": cliente.nombre_negocio,
            },
            "estado": cartera.estado,
            "visitado": cartera.visitado,
            "fecha_visita": cartera.fecha_visita.isoformat() if cartera.fecha_visita else None,
            "observacion": cartera.observacion,
            "solicitudes_count": len(solicitudes),
        })
    return carteras


async def get_cliente_by_dni(db: AsyncSession, dni: str) -> Optional[dict]:
    result = await db.execute(select(Cliente).where(Cliente.dni == dni))
    cliente = result.scalar_one_or_none()
    if not cliente:
        return None

    solicitudes_result = await db.execute(
        select(SolicitudCredito).where(SolicitudCredito.cliente_id == cliente.id)
        .order_by(SolicitudCredito.created_at.desc())
    )
    solicitudes = solicitudes_result.scalars().all()

    return {
        "id": cliente.id,
        "dni": cliente.dni,
        "nombre": cliente.nombre,
        "apellido": cliente.apellido,
        "telefono": cliente.telefono,
        "email": cliente.email,
        "direccion": cliente.direccion,
        "fecha_nacimiento": cliente.fecha_nacimiento.isoformat() if cliente.fecha_nacimiento else None,
        "ocupacion": cliente.ocupacion,
        "ingreso_mensual": cliente.ingreso_mensual,
        "gasto_mensual": cliente.gasto_mensual,
        "nombre_negocio": cliente.nombre_negocio,
        "antiguedad_negocio": cliente.antiguedad_negocio,
        "solicitudes": [
            {
                "id": s.id,
                "numero_expediente": s.numero_expediente,
                "monto": s.monto,
                "plazo": s.plazo,
                "estado": s.estado,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in solicitudes
        ],
    }


async def marcar_visita(db: AsyncSession, cliente_id: int, lat: float, lng: float, observacion: str = None) -> dict:
    result = await db.execute(
        select(Cartera).where(Cartera.cliente_id == cliente_id)
    )
    cartera = result.scalar_one_or_none()
    if not cartera:
        return {"error": "Cliente no encontrado en cartera"}

    from datetime import datetime
    cartera.visitado = True
    cartera.fecha_visita = datetime.utcnow()
    cartera.latitud = lat
    cartera.longitud = lng
    if observacion:
        cartera.observacion = observacion
    await db.commit()
    return {"message": "Visita registrada exitosamente", "cliente_id": cliente_id}


async def get_resumen_cartera(db: AsyncSession, oficial_id: int) -> dict:
    result = await db.execute(
        select(func.count(Cartera.id)).where(Cartera.oficial_id == oficial_id)
    )
    asignados = result.scalar() or 0

    result2 = await db.execute(
        select(func.count(Cartera.id)).where(
            Cartera.oficial_id == oficial_id,
            Cartera.visitado == True
        )
    )
    visitados = result2.scalar() or 0

    return {
        "asignados": asignados,
        "visitados": visitados,
        "pendientes": asignados - visitados,
    }
