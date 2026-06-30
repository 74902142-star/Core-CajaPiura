import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(
    title="Banco Andino - Caja Piura API",
    description="Core Web Backend - Sistema de Originación de Créditos",
    version="1.0.0"
)

origins = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import auth, cartera, pre_evaluacion, buro, solicitudes, comite, desembolso, clientes, dni

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(dni.router, prefix="/api/dni", tags=["Consulta DNI"])
app.include_router(cartera.router, prefix="/api/cartera", tags=["Cartera"])
app.include_router(pre_evaluacion.router, prefix="/api/pre-evaluacion", tags=["Pre-Evaluación"])
app.include_router(buro.router, prefix="/api/buro", tags=["Buró de Crédito"])
app.include_router(solicitudes.router, prefix="/api/solicitudes", tags=["Solicitudes"])
app.include_router(comite.router, prefix="/api/comite", tags=["Comité"])
app.include_router(desembolso.router, prefix="/api/desembolso", tags=["Desembolso"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["Clientes"])


@app.on_event("startup")
async def startup():
    try:
        from database import init_db
        ok = init_db()
        if ok:
            print("🚀 Servicio listo - Conectado a Supabase")
    except Exception as e:
        print(f"⚠️ Supabase no disponible (usando datos en memoria): {e}")


@app.get("/")
async def root():
    return {"message": "Banco Andino - Caja Piura API v1.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "cajapiura-core-web"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
