def calcular_capacidad_pago(ingreso: float, gasto: float, cuota: float) -> dict:
    if ingreso <= 0:
        return {"apto": False, "puntaje": 0, "capacidad_pago": 0, "ratio_endeudamiento": 100, "mensaje": "El ingreso debe ser mayor a cero"}

    capacidad_pago = ingreso - gasto
    ratio_endeudamiento = ((gasto + cuota) / ingreso * 100) if ingreso > 0 else 100

    if ratio_endeudamiento <= 30 and capacidad_pago >= cuota:
        apto, puntaje, mensaje = True, 85, "El cliente cumple con la capacidad de pago requerida"
    elif ratio_endeudamiento <= 40 and capacidad_pago >= cuota:
        apto, puntaje, mensaje = True, 70, "Ratio moderado"
    elif ratio_endeudamiento <= 50 and capacidad_pago >= cuota:
        apto, puntaje, mensaje = True, 55, "Capacidad de pago limitada"
    elif capacidad_pago >= cuota:
        apto, puntaje, mensaje = True, 40, "Nivel de endeudamiento alto"
    else:
        apto, puntaje, mensaje = False, 20, "NO tiene capacidad de pago"

    return {"apto": apto, "puntaje": puntaje, "capacidad_pago": round(capacidad_pago, 2), "ratio_endeudamiento": round(ratio_endeudamiento, 2), "mensaje": mensaje}


def calcular_cuota_francesa(monto, tasa_mensual, plazo):
    tasa = tasa_mensual / 100
    if tasa == 0:
        return monto / plazo
    return round(monto * (tasa * (1 + tasa) ** plazo) / ((1 + tasa) ** plazo - 1), 2)


def generar_cronograma(monto, tasa_mensual, plazo, fecha_inicio=None):
    from datetime import date
    try:
        from dateutil.relativedelta import relativedelta
    except ImportError:
        from datetime import timedelta
        def relativedelta(months=0):
            d = date.today()
            m = d.month + months
            y = d.year + (m - 1) // 12
            m = (m - 1) % 12 + 1
            return date(y, m, min(d.day, 28))

    if fecha_inicio is None:
        fecha_inicio = date.today()

    tasa = tasa_mensual / 100
    cuota = calcular_cuota_francesa(monto, tasa_mensual, plazo)
    saldo = monto
    cronograma = []

    for i in range(1, plazo + 1):
        interes = round(saldo * tasa, 2)
        capital = round(cuota - interes, 2)
        saldo = round(saldo - capital, 2)
        if saldo < 0:
            saldo = 0
        fecha_venc = fecha_inicio + relativedelta(months=i)
        cronograma.append({
            "numero_cuota": i, "fecha_vencimiento": fecha_venc.isoformat(),
            "capital": capital, "interes": interes, "cuota_total": cuota, "saldo": saldo,
        })
    return cronograma
