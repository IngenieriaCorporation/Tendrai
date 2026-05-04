import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import get_settings

settings = get_settings()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def get_upload_path(tender_id: str, subfolder: str = "") -> Path:
    base = Path(settings.UPLOAD_DIR) / str(tender_id)
    if subfolder:
        base = base / subfolder
    base.mkdir(parents=True, exist_ok=True)
    return base


def secure_filename(filename: str) -> str:
    name = Path(filename).stem
    ext = Path(filename).suffix
    safe = "".join(c for c in name if c.isalnum() or c in ("-", "_"))
    return f"{safe[:40]}_{uuid.uuid4().hex[:8]}{ext}"


async def save_upload(file: UploadFile, dest_dir: Path) -> str:
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File '{file.filename}' exceeds 5 MB limit",
        )
    dest_dir.mkdir(parents=True, exist_ok=True)
    filepath = dest_dir / secure_filename(file.filename)
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)
    return str(filepath)
