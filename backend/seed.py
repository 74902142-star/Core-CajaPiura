"""
Script para crear usuarios de prueba en Supabase
Ejecutar: python seed.py
"""
import os
from dotenv import load_dotenv
from supabase import create_client
from passlib.context import CryptContext

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://bphurlirfckhycnwiufr.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_fWqdJUYCyJEs_8HVlW2hcA_QK0Wjpwh")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

USUARIOS = [
    {
        "email": "admin@cajapiura.pe",
        "password": "admin123",
        "nombre": "Carlos",
        "apellido": "Mendoza",
        "rol": "admin",
    },
    {
        "email": "supervisor@cajapiura.pe",
        "password": "super123",
        "nombre": "Maria",
        "apellido": "Torres",
        "rol": "supervisor",
    },
    {
        "email": "asesor@cajapiura.pe",
        "password": "asesor123",
        "nombre": "Juan",
        "apellido": "Perez",
        "rol": "asesor",
    },
    {
        "email": "cliente@cajapiura.pe",
        "password": "cliente123",
        "nombre": "Pedro",
        "apellido": "Garcia",
        "rol": "cliente",
    },
]

CLIENTES = [
    {
        "dni": "12345678",
        "nombre": "Pedro",
        "apellido": "Garcia Lopez",
        "telefono": "951123456",
        "email": "pedro.garcia@email.com",
        "direccion": "Av. Principal 123, Piura",
        "ocupacion": "Comerciante",
        "ingreso_mensual": 5000,
        "gasto_mensual": 2500,
        "nombre_negocio": "Bodega Garcia",
        "antiguedad_negocio": "5 años",
    },
    {
        "dni": "87654321",
        "nombre": "Ana",
        "apellido": "Martinez Ruiz",
        "telefono": "951654321",
        "email": "ana.martinez@email.com",
        "direccion": "Calle Lima 456, Piura",
        "ocupacion": "Emprendedora",
        "ingreso_mensual": 8000,
        "gasto_mensual": 3000,
        "nombre_negocio": "Sastreria Elegante",
        "antiguedad_negocio": "8 años",
    },
    {
        "dni": "11223344",
        "nombre": "Luis",
        "apellido": "Fernandez Vargas",
        "telefono": "951789012",
        "email": "luis.fernandez@email.com",
        "direccion": "Jr. San Martin 789, Piura",
        "ocupacion": "Transportista",
        "ingreso_mensual": 6500,
        "gasto_mensual": 3500,
        "nombre_negocio": "Transportes Fernandez",
        "antiguedad_negocio": "3 años",
    },
    {
        "dni": "44556677",
        "nombre": "Rosa",
        "apellido": "Diaz Morales",
        "telefono": "951345678",
        "email": "rosa.diaz@email.com",
        "direccion": "Av. Piura 321, Piura",
        "ocupacion": "Vendedora",
        "ingreso_mensual": 3500,
        "gasto_mensual": 1800,
        "nombre_negocio": "Minimarket Rosa",
        "antiguedad_negocio": "2 años",
    },
    {
        "dni": "99887766",
        "nombre": "Miguel",
        "apellido": "Sanchez Torres",
        "telefono": "951987654",
        "email": "miguel.sanchez@email.com",
        "direccion": "Calle Arequipa 654, Piura",
        "ocupacion": "Ganadero",
        "ingreso_mensual": 12000,
        "gasto_mensual": 5000,
        "nombre_negocio": "Hacienda Sanchez",
        "antiguedad_negocio": "15 años",
    },
]


def seed_usuarios():
    print("Creando usuarios...")
    for user in USUARIOS:
        try:
            existing = supabase.table("usuarios").select("*").eq("email", user["email"]).execute()
            if existing.data:
                print(f"  Usuario {user['email']} ya existe, saltando...")
                continue

            hashed = pwd_context.hash(user["password"])
            supabase.table("usuarios").insert({
                "email": user["email"],
                "password_hash": hashed,
                "nombre": user["nombre"],
                "apellido": user["apellido"],
                "rol": user["rol"],
                "activo": True,
            }).execute()
            print(f"  Usuario {user['email']} creado exitosamente")
        except Exception as e:
            print(f"  Error creando {user['email']}: {e}")


def seed_clientes():
    print("\nCreando clientes de prueba...")
    for cliente in CLIENTES:
        try:
            existing = supabase.table("clientes").select("*").eq("dni", cliente["dni"]).execute()
            if existing.data:
                print(f"  Cliente DNI {cliente['dni']} ya existe, saltando...")
                continue

            supabase.table("clientes").insert({
                "dni": cliente["dni"],
                "nombre": cliente["nombre"],
                "apellido": cliente["apellido"],
                "telefono": cliente["telefono"],
                "email": cliente["email"],
                "direccion": cliente["direccion"],
                "ocupacion": cliente["ocupacion"],
                "ingreso_mensual": cliente["ingreso_mensual"],
                "gasto_mensual": cliente["gasto_mensual"],
                "nombre_negocio": cliente["nombre_negocio"],
                "antiguedad_negocio": cliente["antiguedad_negocio"],
            }).execute()
            print(f"  Cliente {cliente['nombre']} {cliente['apellido']} creado")
        except Exception as e:
            print(f"  Error creando cliente {cliente['dni']}: {e}")


def seed_cartera():
    print("\nAsignando clientes a cartera...")
    try:
        usuarios = supabase.table("usuarios").select("*").eq("rol", "asesor").execute()
        clientes = supabase.table("clientes").select("*").execute()

        if not usuarios.data or not clientes.data:
            print("  No hay usuarios asesores o clientes para asignar")
            return

        asesor_id = usuarios.data[0]["id"]
        for cliente in clientes.data[:3]:
            existing = supabase.table("cartera").select("*").eq("cliente_id", cliente["id"]).execute()
            if existing.data:
                print(f"  Cliente {cliente['nombre']} ya asignado, saltando...")
                continue

            supabase.table("cartera").insert({
                "oficial_id": asesor_id,
                "cliente_id": cliente["id"],
                "estado": "asignado",
                "visitado": False,
            }).execute()
            print(f"  Cliente {cliente['nombre']} {cliente['apellido']} asignado a cartera")
    except Exception as e:
        print(f"  Error asignando cartera: {e}")


if __name__ == "__main__":
    print("=" * 50)
    print("CAJA PIURA - SEED DE BASE DE DATOS")
    print("=" * 50)
    seed_usuarios()
    seed_clientes()
    seed_cartera()
    print("\n" + "=" * 50)
    print("SEED COMPLETADO")
    print("=" * 50)
    print("\nCredenciales de acceso:")
    print("  Admin:    admin@cajapiura.pe / admin123")
    print("  Asesor:   asesor@cajapiura.pe / asesor123")
    print("  Cliente:  cliente@cajapiura.pe / cliente123")
