from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: dict
    rol: str


class TokenVerifyResponse(BaseModel):
    valid: bool
    user: Optional[dict] = None
    rol: Optional[str] = None


class UsuarioBase(BaseModel):
    email: str
    nombre: str
    apellido: str
    rol: str


class UsuarioCreate(UsuarioBase):
    password: str


class ClienteBase(BaseModel):
    dni: str
    nombre: str
    apellido: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    ocupacion: Optional[str] = None
    ingreso_mensual: Optional[float] = 0
    gasto_mensual: Optional[float] = 0
    nombre_negocio: Optional[str] = None
    antiguedad_negocio: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class ClienteResponse(ClienteBase):
    id: str
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CarteraResponse(BaseModel):
    id: str
    oficial_id: str
    cliente_id: str
    cliente: Optional[ClienteResponse] = None
    fecha_asignacion: Optional[datetime] = None
    estado: Optional[str] = None
    visitado: Optional[bool] = False
    fecha_visita: Optional[datetime] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    observacion: Optional[str] = None


class VisitaRequest(BaseModel):
    cliente_id: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    observacion: Optional[str] = None


class ResumenCartera(BaseModel):
    asignados: int = 0
    visitados: int = 0
    pendientes: int = 0


class PreEvaluacionRequest(BaseModel):
    solicitud_id: Optional[str] = None
    cliente_id: Optional[str] = None
    ingreso: float
    gasto: float
    cuota: float


class PreEvaluacionResponse(BaseModel):
    apto: bool
    puntaje: int
    capacidad_pago: float
    ratio_endeudamiento: float
    mensaje: str


class BuroRequest(BaseModel):
    dni: str


class BuroResponse(BaseModel):
    score: int
    entidades: int
    deuda_total: float
    dias_mora: int
    resultado: str
    inhabilitado: bool
    mensaje: str


class BuroHistorialResponse(BaseModel):
    id: str
    dni: str
    score: Optional[int] = None
    entidades_deuda: Optional[int] = 0
    deuda_total: Optional[float] = 0
    dias_mora: Optional[int] = 0
    resultado: Optional[str] = None
    inhabilitado: Optional[bool] = False
    created_at: Optional[datetime] = None


class SolicitudCreate(BaseModel):
    cliente_id: str
    monto: float
    plazo: int
    tea: Optional[float] = 18.0
    garantia: Optional[str] = None
    destino: Optional[str] = None


class SolicitudResponse(BaseModel):
    id: str
    numero_expediente: str
    cliente_id: str
    cliente: Optional[ClienteResponse] = None
    oficial_id: Optional[str] = None
    monto: float
    plazo: int
    tea: Optional[float] = 18.0
    cuota_estimada: Optional[float] = None
    garantia: Optional[str] = None
    destino: Optional[str] = None
    estado: str
    motivo_rechazo: Optional[str] = None
    monto_aprobado: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class EstadoSolicitudRequest(BaseModel):
    estado: str
    motivo: Optional[str] = None


class ComiteDecisionRequest(BaseModel):
    solicitud_id: str
    decision: str
    monto_aprobado: Optional[float] = None
    motivo: Optional[str] = None


class DesembolsoRequest(BaseModel):
    solicitud_id: str
    monto: float
    fecha: date
    metodo: str


class CronogramaItem(BaseModel):
    numero_cuota: int
    fecha_vencimiento: date
    capital: float
    interes: float
    cuota_total: float
    saldo: float


class TransferenciaRequest(BaseModel):
    cuenta_origen_id: int
    cuenta_destino_id: int
    monto: float
    descripcion: Optional[str] = None


class SolicitudClienteRequest(BaseModel):
    monto: float
    plazo: int
    tea: Optional[float] = 18.0
    garantia: Optional[str] = None
    destino: Optional[str] = None


class MovimientoResponse(BaseModel):
    id: str
    tipo: str
    monto: float
    descripcion: Optional[str] = None
    fecha: Optional[datetime] = None
    saldo: Optional[float] = None
