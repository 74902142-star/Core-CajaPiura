import os
from dotenv import load_dotenv
from supabase import create_client, Client
import bcrypt

load_dotenv()

SUPABASE_URL = "https://bphurlirfckhycnwiufr.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_fWqdJUYCyJEs_8HVlW2hcA_QK0Wjpwh"

_supabase: Client = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _supabase


def init_db():
    try:
        s = get_supabase()
        s.table("cuentas").select("*").limit(1).execute()
        print("✅ Conexión a Supabase OK")
        return True
    except Exception as e:
        print(f"❌ Error conectando a Supabase: {e}")
        return False


# ─── USUARIOS ───
def get_user_by_email(email: str):
    s = get_supabase()
    result = s.table("usuarios").select("*").eq("email", email).limit(1).execute()
    return result.data[0] if result.data else None


def get_user_by_id(user_id: str):
    s = get_supabase()
    result = s.table("usuarios").select("*").eq("id", user_id).limit(1).execute()
    return result.data[0] if result.data else None


# ─── CLIENTES ───
def get_cliente(cliente_id: str):
    s = get_supabase()
    result = s.table("clientes").select("*").eq("id", cliente_id).limit(1).execute()
    if result.data:
        c = result.data[0]
        return {
            "id": c["id"],
            "dni": c.get("numero_documento", ""),
            "nombre": c.get("nombres", ""),
            "apellido": c.get("apellidos", ""),
            "telefono": c.get("telefono", ""),
            "email": c.get("email", ""),
            "direccion": c.get("direccion", ""),
            "fecha_nacimiento": c.get("fecha_nacimiento", None),
        }
    return None


def get_cliente_by_dni(dni: str):
    s = get_supabase()
    result = s.table("clientes").select("*").eq("numero_documento", dni).limit(1).execute()
    if result.data:
        c = result.data[0]
        return {
            "id": c["id"],
            "dni": c.get("numero_documento", ""),
            "nombre": c.get("nombres", ""),
            "apellido": c.get("apellidos", ""),
            "telefono": c.get("telefono", ""),
            "email": c.get("email", ""),
            "direccion": c.get("direccion", ""),
            "fecha_nacimiento": c.get("fecha_nacimiento", None),
        }
    return None


def get_all_clientes():
    s = get_supabase()
    result = s.table("clientes").select("*").execute()
    return [
        {
            "id": c["id"],
            "dni": c.get("numero_documento", ""),
            "nombre": c.get("nombres", ""),
            "apellido": c.get("apellidos", ""),
            "telefono": c.get("telefono", ""),
            "email": c.get("email", ""),
            "direccion": c.get("direccion", ""),
            "fecha_nacimiento": c.get("fecha_nacimiento", None),
        }
        for c in result.data
    ] if result.data else []


def add_cliente(data: dict):
    s = get_supabase()
    from datetime import datetime
    
    db_data = {
        "numero_documento": data.get("dni"),
        "tipo_documento": "DNI",
        "nombres": data.get("nombre"),
        "apellidos": data.get("apellido"),
        "telefono": data.get("telefono"),
        "email": data.get("email"),
        "direccion": data.get("direccion"),
        "created_at": datetime.utcnow().isoformat()
    }
    
    import random
    db_data["cod_cliente"] = f"C{random.randint(1000, 9999)}"
    
    if data.get("fecha_nacimiento"):
        db_data["fecha_nacimiento"] = str(data.get("fecha_nacimiento"))

    result = s.table("clientes").insert(db_data).execute()
    if result.data:
        c = result.data[0]
        return {
            "id": c["id"],
            "dni": c.get("numero_documento", ""),
            "nombre": c.get("nombres", ""),
            "apellido": c.get("apellidos", ""),
            "telefono": c.get("telefono", ""),
            "email": c.get("email", ""),
            "direccion": c.get("direccion", ""),
            "fecha_nacimiento": c.get("fecha_nacimiento", None),
        }
    return data


def update_cliente(cliente_id: str, data: dict):
    s = get_supabase()
    from datetime import datetime
    
    db_data = {}
    if "dni" in data:
        db_data["numero_documento"] = data["dni"]
    if "nombre" in data:
        db_data["nombres"] = data["nombre"]
    if "apellido" in data:
        db_data["apellidos"] = data["apellido"]
    if "telefono" in data:
        db_data["telefono"] = data["telefono"]
    if "email" in data:
        db_data["email"] = data["email"]
    if "direccion" in data:
        db_data["direccion"] = data["direccion"]
    if "fecha_nacimiento" in data and data["fecha_nacimiento"]:
        db_data["fecha_nacimiento"] = str(data["fecha_nacimiento"])
        
    db_data["updated_at"] = datetime.utcnow().isoformat()
    result = s.table("clientes").update(db_data).eq("id", cliente_id).execute()
    if result.data:
        c = result.data[0]
        return {
            "id": c["id"],
            "dni": c.get("numero_documento", ""),
            "nombre": c.get("nombres", ""),
            "apellido": c.get("apellidos", ""),
            "telefono": c.get("telefono", ""),
            "email": c.get("email", ""),
            "direccion": c.get("direccion", ""),
            "fecha_nacimiento": c.get("fecha_nacimiento", None),
        }
    return None


# ─── SOLICITUDES ───
def get_solicitudes(estado: str = None):
    s = get_supabase()
    query = s.table("solicitudes_credito").select("*")
    if estado:
        query = query.eq("estado", estado)
    result = query.execute()
    return [map_solicitud_to_api(x) for x in result.data] if result.data else []


def get_solicitud(sol_id: str):
    s = get_supabase()
    result = s.table("solicitudes_credito").select("*").eq("id", sol_id).limit(1).execute()
    return map_solicitud_to_api(result.data[0]) if result.data else None


def get_solicitud_by_expediente(numero: str):
    s = get_supabase()
    result = s.table("solicitudes_credito").select("*").eq("numero_expediente", numero).limit(1).execute()
    return map_solicitud_to_api(result.data[0]) if result.data else None


def add_solicitud(data: dict):
    import uuid
    from datetime import datetime
    s = get_supabase()
    expediente = f"EXP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    db_data = {
        "cliente_id": data.get("cliente_id"),
        "asesor_id": data.get("oficial_id") or "b1b2c3d4-e5f6-7890-abcd-ef1234567803",
        "monto_solicitado": data.get("monto"),
        "plazo_meses": data.get("plazo"),
        "tea_referencial": data.get("tea"),
        "cuota_estimada": data.get("cuota_estimada"),
        "garantia": data.get("garantia"),
        "destino_credito": data.get("destino"),
        "estado": data.get("estado", "enviado"),
        "numero_expediente": expediente,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = s.table("solicitudes_credito").insert(db_data).execute()
    return map_solicitud_to_api(result.data[0]) if result.data else map_solicitud_to_api(db_data)


def update_solicitud(sol_id: str, data: dict):
    s = get_supabase()
    db_data = {}
    if "estado" in data:
        db_data["estado"] = data["estado"]
    if "motivo_rechazo" in data:
        db_data["motivo_rechazo"] = data["motivo_rechazo"]
    
    db_data["updated_at"] = __import__("datetime").datetime.utcnow().isoformat()
    result = s.table("solicitudes_credito").update(db_data).eq("id", sol_id).execute()
    return map_solicitud_to_api(result.data[0]) if result.data else None


def map_solicitud_to_api(s: dict) -> dict:
    return {
        "id": s.get("id"),
        "cliente_id": s.get("cliente_id"),
        "oficial_id": s.get("asesor_id"),
        "monto": s.get("monto_solicitado"),
        "plazo": s.get("plazo_meses"),
        "tea": s.get("tea_referencial"),
        "cuota_estimada": s.get("cuota_estimada"),
        "garantia": s.get("garantia"),
        "destino": s.get("destino_credito"),
        "estado": s.get("estado"),
        "numero_expediente": s.get("numero_expediente"),
        "created_at": s.get("created_at"),
        "updated_at": s.get("updated_at")
    }


# ─── CARTERA ───
def get_cartera_by_oficial(oficial_id: str):
    import uuid
    try:
        uuid.UUID(str(oficial_id))
    except ValueError:
        return []
    s = get_supabase()
    result = s.table("cartera").select("*").eq("oficial_id", oficial_id).execute()
    return result.data or []


def get_cartera_by_cliente(cliente_id: str):
    s = get_supabase()
    result = s.table("cartera").select("*").eq("cliente_id", cliente_id).limit(1).execute()
    return result.data[0] if result.data else None


def update_cartera_visita(cliente_id: str, observacion: str = None):
    s = get_supabase()
    data = {"visitado": True}
    if observacion:
        data["observacion"] = observacion
    result = s.table("cartera").update(data).eq("cliente_id", cliente_id).execute()
    return result.data[0] if result.data else None


# ─── PRE-EVALUACIONES ───
def save_pre_evaluacion(data: dict):
    s = get_supabase()
    from datetime import datetime
    data["created_at"] = datetime.utcnow().isoformat()
    result = s.table("pre_evaluaciones").insert(data).execute()
    return result.data[0] if result.data else data


def get_pre_evaluacion_by_solicitud(solicitud_id: str):
    s = get_supabase()
    result = s.table("pre_evaluaciones").select("*").eq("solicitud_id", solicitud_id).limit(1).execute()
    return result.data[0] if result.data else None


# ─── BURÓ ───
def save_buro_consulta(data: dict):
    s = get_supabase()
    from datetime import datetime
    data["created_at"] = datetime.utcnow().isoformat()
    result = s.table("buro_consultas").insert(data).execute()
    return result.data[0] if result.data else data


def get_historial_buro(dni: str):
    s = get_supabase()
    result = s.table("buro_consultas").select("*").eq("dni", dni).order("created_at", desc=True).execute()
    return result.data or []


# ─── COMITÉ ───
def save_comite_decision(data: dict):
    s = get_supabase()
    from datetime import datetime
    data["created_at"] = datetime.utcnow().isoformat()
    result = s.table("comite_decisiones").insert(data).execute()
    return result.data[0] if result.data else data


# ─── DESEMBOLSOS ───
def save_desembolso(data: dict):
    s = get_supabase()
    from datetime import datetime
    data["created_at"] = datetime.utcnow().isoformat()
    result = s.table("desembolsos").insert(data).execute()
    return result.data[0] if result.data else data


def get_desembolsos_by_solicitud(solicitud_id: str):
    s = get_supabase()
    result = s.table("desembolsos").select("*").eq("solicitud_id", solicitud_id).execute()
    return result.data or []
