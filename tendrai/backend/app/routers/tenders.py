import os
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.models.tender import Tender
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.tender_service import (
    create_tender,
    upload_tender_files,
    analyze_tender,
    apply_command,
    generate_documents,
)

router = APIRouter(prefix="/tenders", tags=["Tenders"])


class CommandRequest(BaseModel):
    command: str


# ── Create ─────────────────────────────────────────────────────────────

@router.post("/")
async def new_tender(
    title: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    tender = await create_tender(title, str(current_user.id))
    return {"id": str(tender.id), "title": tender.title, "status": tender.status}


# ── Upload files ────────────────────────────────────────────────────────

@router.post("/{tender_id}/upload")
async def upload_files(
    tender_id: str,
    tender_pdf: UploadFile = File(...),
    supporting_pdfs: List[UploadFile] = File(default=[]),
    boq_file: Optional[UploadFile] = File(default=None),
    images: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
):
    tender = await _get_owned(tender_id, current_user)
    result = await upload_tender_files(tender, tender_pdf, supporting_pdfs, boq_file, images)
    return {"message": "Files uploaded successfully", "status": result.status}


# ── AI Analysis ─────────────────────────────────────────────────────────

@router.post("/{tender_id}/analyze")
async def run_analysis(
    tender_id: str,
    current_user: User = Depends(get_current_user),
):
    tender = await _get_owned(tender_id, current_user)
    result = await analyze_tender(tender)
    return {"status": result.status, "data": result.extracted_data}


# ── AI Command Bar ──────────────────────────────────────────────────────

@router.post("/{tender_id}/command")
async def run_command(
    tender_id: str,
    body: CommandRequest,
    current_user: User = Depends(get_current_user),
):
    tender = await _get_owned(tender_id, current_user)
    return await apply_command(tender, body.command)


# ── Generate Documents ──────────────────────────────────────────────────

@router.post("/{tender_id}/generate")
async def generate(
    tender_id: str,
    current_user: User = Depends(get_current_user),
):
    tender = await _get_owned(tender_id, current_user)
    await generate_documents(tender)
    return {"message": "Documents generated successfully", "zip_ready": True}


# ── Download ZIP ────────────────────────────────────────────────────────

@router.get("/{tender_id}/download")
async def download_zip(
    tender_id: str,
    current_user: User = Depends(get_current_user),
):
    tender = await _get_owned(tender_id, current_user)
    if not tender.output_zip_path or not os.path.exists(tender.output_zip_path):
        raise HTTPException(404, "ZIP not ready. Generate documents first.")
    return FileResponse(
        tender.output_zip_path,
        media_type="application/zip",
        filename=f"Tender_{tender_id}_Final.zip",
    )


# ── List ─────────────────────────────────────────────────────────────────

@router.get("/")
async def list_tenders(current_user: User = Depends(get_current_user)):
    tenders = await Tender.find(
        Tender.owner_id == str(current_user.id)
    ).sort(-Tender.created_at).to_list()
    return [_serialize(t) for t in tenders]


# ── Get Single ────────────────────────────────────────────────────────────

@router.get("/{tender_id}")
async def get_tender(
    tender_id: str,
    current_user: User = Depends(get_current_user),
):
    tender = await _get_owned(tender_id, current_user)
    return _serialize(tender, full=True)


# ── Audit Log ─────────────────────────────────────────────────────────────

@router.get("/{tender_id}/audit")
async def get_audit(
    tender_id: str,
    current_user: User = Depends(get_current_user),
):
    tender = await _get_owned(tender_id, current_user)
    return [
        {
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.isoformat(),
        }
        for log in reversed(tender.audit_logs)
    ]


# ── helpers ───────────────────────────────────────────────────────────────

async def _get_owned(tender_id: str, user: User) -> Tender:
    try:
        tender = await Tender.get(tender_id)
    except Exception:
        raise HTTPException(404, "Tender not found")
    if not tender or tender.owner_id != str(user.id):
        raise HTTPException(404, "Tender not found")
    return tender


def _serialize(t: Tender, full: bool = False) -> dict:
    base = {
        "id": str(t.id),
        "title": t.title,
        "status": t.status,
        "created_at": t.created_at.isoformat(),
        "updated_at": t.updated_at.isoformat(),
    }
    if full:
        base["extracted_data"] = t.extracted_data
        base["version_history"] = [v.model_dump() for v in t.version_history]
        base["zip_ready"] = bool(t.output_zip_path)
    return base
