import enum


class RolUsuario(str, enum.Enum):
    ADMIN = "admin"
    SUPERVISOR = "supervisor"
    ASESOR = "asesor"
    CLIENTE = "cliente"


class EstadoSolicitud(str, enum.Enum):
    ENVIADO = "enviado"
    RECIBIDO_COMITE = "recibido_comite"
    EN_EVALUACION = "en_evaluacion"
    APROBADO = "aprobado"
    CONDICIONADO = "condicionado"
    RECHAZADO = "rechazado"
    DESEMBOLSADO = "desembolsado"


class ResultadoBuro(str, enum.Enum):
    NORMAL = "NORMAL"
    CPP = "CPP"
    DEFICIENTE = "DEFICIENTE"
    DUDOSO = "DUDOSO"
