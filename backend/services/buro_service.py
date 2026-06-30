import random

LISTA_NEGRA = ["12345678", "87654321", "11111111", "22222222", "00000000"]


def simular_buro(dni: str) -> dict:
    ultimo_digito = int(dni[-1]) if dni else 0

    if dni in LISTA_NEGRA:
        return {
            "score": 200, "entidades": 5, "deuda_total": 45000.00,
            "dias_mora": 180, "resultado": "DUDOSO", "inhabilitado": True,
            "mensaje": "Cliente en lista de inhabilitados. CRÉDITO RECHAZADO."
        }

    if ultimo_digito <= 2:
        score = random.randint(350, 500)
        entidades = random.randint(3, 6)
        deuda = random.uniform(15000, 50000)
        dias_mora = random.randint(30, 120)
        resultado = "DEFICIENTE"
    elif ultimo_digito <= 4:
        score = random.randint(500, 650)
        entidades = random.randint(2, 4)
        deuda = random.uniform(8000, 25000)
        dias_mora = random.randint(10, 45)
        resultado = "CPP"
    elif ultimo_digito <= 7:
        score = random.randint(650, 800)
        entidades = random.randint(1, 3)
        deuda = random.uniform(2000, 12000)
        dias_mora = random.randint(0, 15)
        resultado = "NORMAL"
    else:
        score = random.randint(800, 950)
        entidades = random.randint(0, 2)
        deuda = random.uniform(0, 5000)
        dias_mora = 0
        resultado = "NORMAL"

    return {
        "score": score, "entidades": entidades, "deuda_total": round(deuda, 2),
        "dias_mora": dias_mora, "resultado": resultado, "inhabilitado": False,
        "mensaje": f"Consulta realizada. Calificación: {resultado}"
    }


def consultar_buro(dni: str) -> dict:
    return simular_buro(dni)


_buro_historial = {}


def get_historial_buro(dni: str):
    return _buro_historial.get(dni, [])


def add_historial_buro(dni: str, consulta: dict):
    if dni not in _buro_historial:
        _buro_historial[dni] = []
    from datetime import datetime
    _buro_historial[dni].append({**consulta, "id": len(_buro_historial[dni]) + 1, "created_at": datetime.utcnow().isoformat()})
