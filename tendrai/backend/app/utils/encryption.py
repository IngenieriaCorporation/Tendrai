import base64
import hashlib
import json
from app.config import get_settings

settings = get_settings()


def encrypt_payload(data: dict) -> str:
    """
    Mock AES encryption placeholder.
    Replace with PyCryptodome AES-256-CBC in production for real SBI ePay integration.
    """
    json_str = json.dumps(data)
    encoded = base64.b64encode(json_str.encode()).decode()
    checksum = hashlib.sha256(
        (json_str + settings.SBI_ENCRYPTION_KEY).encode()
    ).hexdigest()[:8]
    return f"{encoded}.{checksum}"


def decrypt_payload(encrypted: str) -> dict:
    """
    Mock AES decryption placeholder.
    """
    try:
        parts = encrypted.split(".")
        if len(parts) < 2:
            return {}
        decoded = base64.b64decode(parts[0]).decode()
        return json.loads(decoded)
    except Exception:
        return {}
