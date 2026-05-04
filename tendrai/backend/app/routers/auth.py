from fastapi import APIRouter
from pydantic import BaseModel
from app.services.auth_service import register_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(data: RegisterRequest):
    user = await register_user(data.email, data.full_name, data.password)
    return {
        "message": "Registration successful",
        "email": user.email,
        "full_name": user.full_name,
    }


@router.post("/login")
async def login(data: LoginRequest):
    token = await authenticate_user(data.email, data.password)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
async def me_endpoint():
    """Placeholder — use get_current_user dependency in protected routes"""
    return {"detail": "Use Authorization: Bearer <token> header"}
