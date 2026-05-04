import logging
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import User
from app.utils.security import verify_password, get_password_hash, create_access_token, decode_token

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer()


async def register_user(email: str, full_name: str, password: str) -> User:
    existing = await User.find_one(User.email == email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=email,
        full_name=full_name,
        hashed_password=get_password_hash(password),
    )
    await user.insert()
    logger.info(f"New user registered: {email}")
    return user


async def authenticate_user(email: str, password: str) -> str:
    user = await User.find_one(User.email == email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return token


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await User.get(payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user
