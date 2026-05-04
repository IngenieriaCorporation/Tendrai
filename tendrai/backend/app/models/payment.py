from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional


class Payment(Document):
    user_id: str
    order_id: str
    merchant_id: str
    amount: float
    status: str = "pending"          # pending | success | failed
    transaction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "payments"
        indexes = [
            [("order_id", 1)],
            [("user_id", 1)],
        ]
