from fastapi import APIRouter, Depends, HTTPException
from schemas import ComiteDecisionRequest
from auth import get_current_user
from database import get_solicitud, update_solicitud, get_cliente, get_solicitudes

router = APIRouter()


@router.post("/evaluar")
async def evaluar(request: ComiteDecisionRequest, user: dict = Depends(get_current_user)):
    sol = get_solicitud(request.solicitud_id)
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if sol["estado"] not in ["recibido_comite", "enviado"]:
        raise HTTPException(status_code=400, detail=f"Estado actual: {sol['estado']}")
    update_solicitud(request.solicitud_id, {"estado": "en_evaluacion"})
    return {"message": "Solicitud en evaluación", "solicitud_id": request.solicitud_id, "numero_expediente": sol["numero_expediente"]}


@router.post("/decision")
async def decidir(request: ComiteDecisionRequest, user: dict = Depends(get_current_user)):
    sol = get_solicitud(request.solicitud_id)
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if request.decision not in ["aprobado", "rechazado", "condicionado"]:
        raise HTTPException(status_code=400, detail="Decisión inválida")
    data = {"estado": request.decision}
    if request.motivo:
        data["motivo_rechazo"] = request.motivo
    if request.monto_aprobado:
        data["monto_aprobado"] = request.monto_aprobado
    update_solicitud(request.solicitud_id, data)
    return {"message": f"Solicitud {request.decision}", "solicitud_id": request.solicitud_id, "numero_expediente": sol["numero_expediente"]}


@router.get("/pendientes")
async def pendientes(user: dict = Depends(get_current_user)):
    sols = get_solicitudes("recibido_comite")
    result = []
    for s in sols:
        cliente = get_cliente(s.get("cliente_id", ""))
        result.append({**s, "cliente": cliente})
    return {"data": result, "total": len(result)}
