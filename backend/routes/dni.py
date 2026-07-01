from fastapi import APIRouter, Depends
from auth import get_current_user
from services.dni_service import consultar_dni
from database import get_cliente_by_dni

router = APIRouter()


@router.get("/{dni}")
async def buscar_dni(dni: str, user: dict = Depends(get_current_user)):
    # 1. Buscar en base de datos local
    cliente = get_cliente_by_dni(dni)
    if cliente:
        return {
            "id": cliente["id"],
            "dni": cliente["dni"],
            "nombre": cliente["nombre"],
            "apellido": cliente.get("apellido", ""),
            "telefono": cliente.get("telefono", ""),
            "email": cliente.get("email", ""),
            "direccion": cliente.get("direccion", ""),
            "ocupacion": cliente.get("ocupacion", ""),
            "ingreso_mensual": cliente.get("ingreso_mensual", 0),
            "gasto_mensual": cliente.get("gasto_mensual", 0),
            "nombre_negocio": cliente.get("nombre_negocio", ""),
            "antiguedad_negocio": cliente.get("antiguedad_negocio", ""),
            "db": True
        }
    
    # 2. Si no existe, consultar RENIEC
    resultado = await consultar_dni(dni)
    return resultado
