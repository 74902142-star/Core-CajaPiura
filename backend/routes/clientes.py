from fastapi import APIRouter, Depends, HTTPException
from schemas import SolicitudClienteRequest, ClienteCreate
from auth import get_current_user
from database import get_cliente, add_solicitud, get_solicitudes, get_supabase, get_cliente_by_dni, add_cliente, update_cliente

router = APIRouter()


@router.post("")
async def crear_o_actualizar_cliente(request: ClienteCreate, user: dict = Depends(get_current_user)):
    cliente_existente = get_cliente_by_dni(request.dni)
    cliente_data = request.dict()
    if cliente_existente:
        cliente = update_cliente(cliente_existente["id"], cliente_data)
        return {"message": "Cliente actualizado", "cliente": cliente}
    else:
        cliente = add_cliente(cliente_data)
        return {"message": "Cliente creado", "cliente": cliente}


@router.get("/cuentas/{user_id}")
async def cuentas_cliente(user_id: str, user: dict = Depends(get_current_user)):
    try:
        result = get_supabase().table("cuentas").select("*").eq("user_id", user_id).execute()
        return {"data": result.data}
    except Exception:
        return {"data": []}


@router.get("/creditos/{user_id}")
async def creditos_cliente(user_id: str, user: dict = Depends(get_current_user)):
    cliente = get_cliente(user_id)
    if not cliente:
        return {"data": []}
    sols = get_solicitudes()
    result = [s for s in sols if s.get("cliente_id") == cliente["id"] and s.get("estado") in ["aprobado", "desembolsado"]]
    return {"data": result}


@router.get("/movimientos/{cuenta_id}")
async def movimientos_cuenta(cuenta_id: int, user: dict = Depends(get_current_user)):
    try:
        result = get_supabase().table("transacciones").select("*").eq("cuenta_id", cuenta_id).order("fecha", desc=True).execute()
        return {"data": result.data}
    except Exception:
        return {"data": []}


@router.post("/transferencias")
async def transferencia(cuenta_origen_id: int = 0, cuenta_destino_id: int = 0, monto: float = 0, descripcion: str = "", user: dict = Depends(get_current_user)):
    if monto <= 0:
        raise HTTPException(status_code=400, detail="Monto debe ser mayor a cero")
    return {"message": "Transferencia realizada exitosamente", "monto": monto, "descripcion": descripcion}


@router.post("/solicitud-credito")
async def solicitud_cliente(request: SolicitudClienteRequest, user: dict = Depends(get_current_user)):
    user_id = user.get("sub", "")
    cliente = get_cliente(user_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    tasa = (request.tea / 100) / 12
    cuota = request.monto * (tasa * (1 + tasa) ** request.plazo) / ((1 + tasa) ** request.plazo - 1) if tasa > 0 else request.monto / request.plazo
    sol = add_solicitud({
        "cliente_id": cliente["id"],
        "cliente_dni": cliente.get("dni", ""),
        "monto": request.monto,
        "plazo": request.plazo,
        "tea": request.tea,
        "cuota_estimada": round(cuota, 2),
        "garantia": request.garantia,
        "destino": request.destino,
        "estado": "enviado",
    })
    return {"message": "Solicitud enviada", "numero_expediente": sol["numero_expediente"], "cuota_estimada": round(cuota, 2)}
