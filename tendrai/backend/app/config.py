from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "tendrai"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    OPENAI_API_KEY: str = ""
    UPLOAD_DIR: str = "./uploads"
    FRONTEND_URL: str = ""
    SBI_MERCHANT_ID: str = "TENDRAI001"
    SBI_ENCRYPTION_KEY: str = "mock-encryption-key-32bytes!!!!!!"
    SBI_EPAY_URL: str = "https://www.sbiepay.sbi/secure/AggregatorHostedListener"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
