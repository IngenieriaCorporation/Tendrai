from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


class AuditEntry(BaseModel):
    action: str
    details: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class VersionEntry(BaseModel):
    version: int
    command: Optional[str] = None
    summary: Optional[str] = None
    data: Dict[str, Any] = {}
    timestamp: str = ""


class Tender(Document):
    title: str
    status: str = "uploaded"          # uploaded | analyzing | analyzed | generating | completed
    owner_id: str                      # stringified ObjectId of User
    tender_pdf_path: Optional[str] = None
    boq_path: Optional[str] = None
    output_zip_path: Optional[str] = None
    supporting_doc_paths: List[str] = []
    extracted_data: Optional[Dict[str, Any]] = None
    version_history: List[VersionEntry] = []
    audit_logs: List[AuditEntry] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tenders"
