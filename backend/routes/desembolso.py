from fastapi import APIRouter, Depends, HTTPException
from schemas import DesembolsoRequest
from auth import get_current_user
from database import get_solicitud, update_solicitud, get_cliente, get_solicitudes
from services.pre_evaluacion_service import generar_cronograma

router = APIRouter()


@router.post("")
async def registrar_desembolso(request: DesembolsoRequest, user: dict = Depends(get_current_user)):
    sol = get_solicitud(request.solicitud_id)
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if sol["estado"] != "aprobado":
        raise HTTPException(status_code=400, detail=f"Estado actual: {sol['estado']}. Debe estar aprobada.")
    update_solicitud(request.solicitud_id, {"estado": "desembolsado"})
    return {"message": "Desembolso registrado", "solicitud_id": request.solicitud_id, "numero_expediente": sol["numero_expediente"], "monto": request.monto}


@router.get("/cronograma/{solicitud_id}")
async def obtener_cronograma(solicitud_id: str, user: dict = Depends(get_current_user)):
    sol = get_solicitud(solicitud_id)
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    tasa_mensual = sol.get("tea", 18) / 100 / 12
    cronograma = generar_cronograma(sol["monto"], tasa_mensual * 100, sol["plazo"])
    return {"solicitud_id": solicitud_id, "numero_expediente": sol["numero_expediente"], "monto": sol["monto"], "plazo": sol["plazo"], "tea": sol.get("tea"), "cronograma": cronograma}


@router.get("/pendientes")
async def desembolsos_pendientes(user: dict = Depends(get_current_user)):
    sols = get_solicitudes("aprobado")
    result = []
    for s in sols:
        cliente = get_cliente(s.get("cliente_id", ""))
        result.append({**s, "cliente": cliente, "monto_aprobado": s.get("monto_aprobado") or s["monto"]})
    return {"data": result, "total": len(result)}
