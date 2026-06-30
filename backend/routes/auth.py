from fastapi import APIRouter, Depends, HTTPException
from schemas import LoginRequest, LoginResponse, TokenVerifyResponse
from auth import verify_password, create_access_token, get_current_user
from database import get_user_by_email, get_user_by_id

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        user = get_user_by_email(request.email)
        if not user:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        if not verify_password(request.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        token = create_access_token(data={
            "sub": str(user["id"]),
            "email": user["email"],
            "nombre": user["nombre"],
            "apellido": user["apellido"],
            "rol": user["rol"],
        })

        return LoginResponse(
            token=token,
            user={
                "id": user["id"],
                "email": user["email"],
                "nombre": user["nombre"],
                "apellido": user["apellido"],
                "rol": user["rol"],
            },
            rol=user["rol"],
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=500,
            detail=f"Error interno: {str(e)}\n{traceback.format_exc()}"
        )


@router.get("/verify", response_model=TokenVerifyResponse)
async def verify_token(user: dict = Depends(get_current_user)):
    return TokenVerifyResponse(
        valid=True,
        user={
            "id": user.get("sub", ""),
            "email": user.get("email"),
            "nombre": user.get("nombre"),
            "apellido": user.get("apellido"),
        },
        rol=user.get("rol"),
    )


@router.post("/logout")
async def logout():
    return {"message": "Sesión cerrada exitosamente"}
