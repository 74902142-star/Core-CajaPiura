from fastapi import APIRouter, Depends
from auth import get_current_user
from services.dni_service import consultar_dni

router = APIRouter()


@router.get("/{dni}")
async def buscar_dni(dni: str, user: dict = Depends(get_current_user)):
    resultado = await consultar_dni(dni)
    return resultado
