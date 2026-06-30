from fastapi import APIRouter, Depends, HTTPException
from schemas import PreEvaluacionRequest, PreEvaluacionResponse
from services.pre_evaluacion_service import calcular_capacidad_pago
from auth import get_current_user
from database import get_solicitud, save_pre_evaluacion, get_pre_evaluacion_by_solicitud

router = APIRouter()


@router.post("", response_model=PreEvaluacionResponse)
async def pre_evaluar(request: PreEvaluacionRequest, user: dict = Depends(get_current_user)):
    resultado = calcular_capacidad_pago(request.ingreso, request.gasto, request.cuota)
    return PreEvaluacionResponse(**resultado)


@router.get("/{solicitud_id}")
async def obtener_pre_evaluacion(solicitud_id: str, user: dict = Depends(get_current_user)):
    sol = get_solicitud(solicitud_id)
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    pre_eval = get_pre_evaluacion_by_solicitud(solicitud_id)
    return {
        "solicitud_id": solicitud_id,
        "monto": sol["monto"],
        "plazo": sol["plazo"],
        "cuota_estimada": sol.get("cuota_estimada"),
        "pre_evaluacion": pre_eval,
    }


@router.post("/guardar")
async def guardar_pre_evaluacion(request: PreEvaluacionRequest, user: dict = Depends(get_current_user)):
    resultado = calcular_capacidad_pago(request.ingreso, request.gasto, request.cuota)

    save_pre_evaluacion({
        "solicitud_id": request.solicitud_id,
        "cliente_id": request.cliente_id,
        "ingreso": request.ingreso,
        "gasto": request.gasto,
        "cuota_solicitada": request.cuota,
        "capacidad_pago": resultado["capacidad_pago"],
        "ratio_endeudamiento": resultado["ratio_endeudamiento"],
        "puntaje": resultado["puntaje"],
        "apto": resultado["apto"],
        "observacion": resultado.get("mensaje", ""),
    })

    return {"message": "Pre-evaluación guardada", "resultado": resultado}
