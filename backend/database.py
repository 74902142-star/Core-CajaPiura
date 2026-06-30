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
    return result.data[0] if result.data else None


def get_cliente_by_dni(dni: str):
    s = get_supabase()
    result = s.table("clientes").select("*").eq("dni", dni).limit(1).execute()
    return result.data[0] if result.data else None


def get_all_clientes():
    s = get_supabase()
    result = s.table("clientes").select("*").execute()
    return result.data or []


# ─── SOLICITUDES ───
def get_solicitudes(estado: str = None):
    s = get_supabase()
    query = s.table("solicitudes_credito").select("*")
    if estado:
        query = query.eq("estado", estado)
    result = query.execute()
    return result.data or []


def get_solicitud(sol_id: str):
    s = get_supabase()
    result = s.table("solicitudes_credito").select("*").eq("id", sol_id).limit(1).execute()
    return result.data[0] if result.data else None


def get_solicitud_by_expediente(numero: str):
    s = get_supabase()
    result = s.table("solicitudes_credito").select("*").eq("numero_expediente", numero).limit(1).execute()
    return result.data[0] if result.data else None


def add_solicitud(data: dict):
    import uuid
    from datetime import datetime
    s = get_supabase()
    expediente = f"EXP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    data["numero_expediente"] = expediente
    data["created_at"] = datetime.utcnow().isoformat()
    result = s.table("solicitudes_credito").insert(data).execute()
    return result.data[0] if result.data else data


def update_solicitud(sol_id: str, data: dict):
    s = get_supabase()
    data["updated_at"] = __import__("datetime").datetime.utcnow().isoformat()
    result = s.table("solicitudes_credito").update(data).eq("id", sol_id).execute()
    return result.data[0] if result.data else None


# ─── CARTERA ───
def get_cartera_by_oficial(oficial_id: str):
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
