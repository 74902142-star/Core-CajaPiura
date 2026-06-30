from fastapi import APIRouter, Depends, HTTPException
from schemas import BuroRequest
from services.buro_service import consultar_buro, get_historial_buro
from auth import get_current_user
from database import get_cliente_by_dni

router = APIRouter()


@router.get("/{dni}")
async def consultar_buro_dni(dni: str, user: dict = Depends(get_current_user)):
    cliente = get_cliente_by_dni(dni)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado en el sistema")
    resultado = consultar_buro(dni)
    return resultado


@router.post("/consultar")
async def guardar_consulta(request: BuroRequest, user: dict = Depends(get_current_user)):
    resultado = consultar_buro(request.dni)
    return {"message": "Consulta realizada", "resultado": resultado}


@router.get("/historico/{dni}")
async def historial_consultas(dni: str, user: dict = Depends(get_current_user)):
    historial = get_historial_buro(dni)
    return {"data": historial}
