import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.models.user import User
from app.models.payment import Payment
from app.services.auth_service import get_current_user
from app.utils.encryption import encrypt_payload, decrypt_payload
from app.config import get_settings

router = APIRouter(prefix="/payments", tags=["Payments"])
settings = get_settings()


class CreatePaymentRequest(BaseModel):
    amount: float
    description: str = "Tender Processing Fee"


# ── Create Payment Order ─────────────────────────────────────────────────

@router.post("/create-payment")
async def create_payment(
    body: CreatePaymentRequest,
    current_user: User = Depends(get_current_user),
):
    order_id = f"TNDRAI-{uuid.uuid4().hex[:12].upper()}"

    payment = Payment(
        user_id=str(current_user.id),
        order_id=order_id,
        merchant_id=settings.SBI_MERCHANT_ID,
        amount=body.amount,
        status="pending",
    )
    await payment.insert()

    payload = {
        "merchantId": settings.SBI_MERCHANT_ID,
        "orderId": order_id,
        "amount": f"{body.amount:.2f}",
        "currencyType": "INR",
        "description": body.description,
        "customerId": str(current_user.id),
        "customerEmail": current_user.email,
    }
    encrypted = encrypt_payload(payload)

    return {
        "order_id": order_id,
        "amount": body.amount,
        "merchant_id": settings.SBI_MERCHANT_ID,
        "encrypted_payload": encrypted,
        "payment_url": settings.SBI_EPAY_URL,
        "status": "pending",
        "note": (
            "POST the 'encrypted_payload' as 'EncryptedRequest' param to 'payment_url'. "
            "SBI will redirect back to your callback URL."
        ),
    }


# ── SBI ePay Callback ────────────────────────────────────────────────────

@router.post("/payment-response")
async def payment_response(EncryptedResponse: str = None):
    if not EncryptedResponse:
        raise HTTPException(400, "Missing EncryptedResponse parameter")

    data = decrypt_payload(EncryptedResponse)
    order_id = data.get("orderId") or data.get("order_id", "")
    status_raw = data.get("status", "").upper()
    txn_id = data.get("transactionId") or data.get("txnId", "")

    payment = await Payment.find_one(Payment.order_id == order_id)
    if not payment:
        raise HTTPException(404, f"Order '{order_id}' not found")

    payment.status = "success" if status_raw in ("SUCCESS", "Y", "1") else "failed"
    payment.transaction_id = txn_id
    payment.updated_at = datetime.utcnow()
    await payment.save()

    return {
        "order_id": order_id,
        "status": payment.status,
        "transaction_id": txn_id,
    }


# ── Payment History ──────────────────────────────────────────────────────

@router.get("/history")
async def payment_history(current_user: User = Depends(get_current_user)):
    payments = await Payment.find(
        Payment.user_id == str(current_user.id)
    ).sort(-Payment.created_at).to_list()
    return [
        {
            "order_id": p.order_id,
            "amount": p.amount,
            "status": p.status,
            "transaction_id": p.transaction_id,
            "created_at": p.created_at.isoformat(),
        }
        for p in payments
    ]
