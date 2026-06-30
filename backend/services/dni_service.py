import httpx

DNI_API_URL = "https://dniruc.apisperu.com/api/v1/dni"
DNI_API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImpmY2M5NTAxMjMwOUBnbWFpbC5jb20ifQ.UaK6eecpbt-mVnF9hI-BYSHtl6QQ5hCLU1MNItWe9P8"


async def consultar_dni(dni: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            url = f"{DNI_API_URL}/{dni}?token={DNI_API_TOKEN}"
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") is False or data.get("error"):
                    return {"error": "DNI no encontrado en RENIEC"}
                return {
                    "dni": data.get("dni", dni),
                    "nombre": data.get("nombres", ""),
                    "apellido": f"{data.get('apellidoPaterno', '')} {data.get('apellidoMaterno', '')}".strip(),
                    "sexo": data.get("sexo", ""),
                    "direccion": data.get("direccion", ""),
                    "departamento": data.get("departamento", ""),
                    "provincia": data.get("provincia", ""),
                    "distrito": data.get("distrito", ""),
                    "fecha_nacimiento": data.get("fechaNacimiento", ""),
                    "telefono": data.get("telefono", ""),
                }
            return {"error": f"Error consultando DNI: {response.status_code}"}
    except httpx.TimeoutException:
        return {"error": "Timeout al consultar DNI"}
    except Exception as e:
        return {"error": f"Error: {str(e)}"}
