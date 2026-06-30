from fastapi import APIRouter, Depends, HTTPException, Query
from schemas import SolicitudCreate, EstadoSolicitudRequest
from auth import get_current_user
from database import get_solicitudes, get_solicitud, add_solicitud, update_solicitud, get_cliente, get_solicitud_by_expediente

router = APIRouter()


@router.post("")
async def crear_solicitud(request: SolicitudCreate, user: dict = Depends(get_current_user)):
    cliente = get_cliente(request.cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    tasa = (request.tea / 100) / 12
    cuota = request.monto * (tasa * (1 + tasa) ** request.plazo) / ((1 + tasa) ** request.plazo - 1) if tasa > 0 else request.monto / request.plazo

    sol = add_solicitud({
        "cliente_id": request.cliente_id,
        "cliente_dni": cliente.get("dni", ""),
        "oficial_id": user.get("sub", ""),
        "monto": request.monto,
        "plazo": request.plazo,
        "tea": request.tea,
        "cuota_estimada": round(cuota, 2),
        "garantia": request.garantia,
        "destino": request.destino,
        "estado": "enviado",
    })
    return {"message": "Solicitud creada", "solicitud": sol}


@router.get("")
async def listar_solicitudes(estado: str = Query(None), user: dict = Depends(get_current_user)):
    sols = get_solicitudes(estado)
    result = []
    for s in sols:
        cliente = get_cliente(s.get("cliente_id", ""))
        result.append({**s, "cliente": cliente})
    return {"data": result, "total": len(result)}


@router.get("/{solicitud_id}")
async def detalle_solicitud(solicitud_id: str, user: dict = Depends(get_current_user)):
    sol = get_solicitud(solicitud_id)
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    cliente = get_cliente(sol.get("cliente_id", ""))
    return {**sol, "cliente": cliente}


@router.patch("/{solicitud_id}/estado")
async def cambiar_estado(solicitud_id: str, request: EstadoSolicitudRequest, user: dict = Depends(get_current_user)):
    sol = update_solicitud(solicitud_id, {"estado": request.estado, "motivo_rechazo": request.motivo})
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return {"message": f"Estado cambiado a {request.estado}", "solicitud_id": solicitud_id}


@router.get("/expediente/{numero}")
async def buscar_por_expediente(numero: str, user: dict = Depends(get_current_user)):
    sol = get_solicitud_by_expediente(numero)
    if not sol:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    cliente = get_cliente(sol.get("cliente_id", ""))
    return {**sol, "cliente": cliente}
