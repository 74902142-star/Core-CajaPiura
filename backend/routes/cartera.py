from fastapi import APIRouter, Depends, HTTPException
from schemas import VisitaRequest
from auth import get_current_user
from database import get_cartera_by_oficial, get_cliente, get_solicitudes, get_cliente_by_dni, update_cartera_visita

router = APIRouter()


@router.get("/resumen")
async def resumen_cartera(user: dict = Depends(get_current_user)):
    oficial_id = user.get("sub", "")
    mis_carteras = get_cartera_by_oficial(oficial_id)
    visitados = sum(1 for c in mis_carteras if c.get("visitado"))
    return {
        "asignados": len(mis_carteras),
        "visitados": visitados,
        "pendientes": len(mis_carteras) - visitados,
    }


@router.get("/{oficial_id}")
async def lista_cartera(oficial_id: str, user: dict = Depends(get_current_user)):
    mis_carteras = get_cartera_by_oficial(oficial_id)
    result = []
    for cartera in mis_carteras:
        cliente = get_cliente(cartera["cliente_id"])
        if cliente:
            sols = get_solicitudes()
            sols_cliente = [s for s in sols if s.get("cliente_id") == cliente["id"]]
            result.append({
                **cartera,
                "cliente": cliente,
                "solicitudes_count": len(sols_cliente),
            })
    return {"data": result, "total": len(result)}


@router.get("/cliente/{dni}")
async def ficha_cliente(dni: str, user: dict = Depends(get_current_user)):
    cliente = get_cliente_by_dni(dni)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    sols = get_solicitudes()
    sols_cliente = [s for s in sols if s.get("cliente_id") == cliente["id"]]
    return {**cliente, "solicitudes": sols_cliente}


@router.get("/cliente/{dni}/historial")
async def historial_cliente(dni: str, user: dict = Depends(get_current_user)):
    cliente = get_cliente_by_dni(dni)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    sols = get_solicitudes()
    sols_cliente = [s for s in sols if s.get("cliente_id") == cliente["id"]]
    return {"historial": sols_cliente}


@router.patch("/visita")
async def registrar_visita(request: VisitaRequest, user: dict = Depends(get_current_user)):
    result = update_cartera_visita(request.cliente_id, request.observacion)
    if not result:
        raise HTTPException(status_code=404, detail="Cliente no encontrado en cartera")
    return {"message": "Visita registrada exitosamente", "cliente_id": request.cliente_id}
