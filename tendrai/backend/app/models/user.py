from beanie import Document
from datetime import datetime
from typing import Optional
from pydantic import Field


class User(Document):
    email: str
    full_name: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            [("email", 1)],  # unique index handled via Atlas or via code
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
            }
        }
