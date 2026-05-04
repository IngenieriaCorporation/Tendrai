import os
import shutil
import zipfile
import logging
from pathlib import Path
from datetime import datetime
from fastapi import HTTPException, UploadFile

from app.models.tender import Tender, AuditEntry, VersionEntry
from app.utils.file_utils import get_upload_path, save_upload
from app.services.ai_service import extract_tender_data, process_ai_command
from app.services.pdf_service import (
    generate_cover_letter,
    generate_compliance_checklist,
    generate_summary_txt,
)

logger = logging.getLogger(__name__)


# ── helpers ──────────────────────────────────────────────────────────────

def _extract_pdf_text(filepath: str) -> str:
    try:
        import PyPDF2
        text_pages = []
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text_pages.append(page.extract_text() or "")
        return "\n".join(text_pages)
    except Exception as e:
        logger.error(f"PDF text extraction failed: {e}")
        return ""


async def _log(tender: Tender, action: str, details: str):
    tender.audit_logs.append(AuditEntry(action=action, details=details))
    await tender.save()


# ── service functions ─────────────────────────────────────────────────────

async def create_tender(title: str, owner_id: str) -> Tender:
    tender = Tender(title=title, owner_id=owner_id)
    await tender.insert()
    await _log(tender, "CREATED", f"Tender '{title}' created")
    return tender


async def upload_tender_files(
    tender: Tender,
    tender_pdf: UploadFile,
    supporting_pdfs: list,
    boq_file: UploadFile = None,
    images: list = None,
) -> Tender:
    tid = str(tender.id)
    base = get_upload_path(tid)

    # Main tender PDF
    if tender_pdf and tender_pdf.filename:
        path = await save_upload(tender_pdf, base / "tender")
        tender.tender_pdf_path = path
        await _log(tender, "UPLOAD", f"Main PDF: {tender_pdf.filename}")

    # Supporting PDFs (max 20)
    if supporting_pdfs:
        if len(supporting_pdfs) > 20:
            raise HTTPException(400, "Maximum 20 supporting PDFs allowed")
        supp_dir = base / "supporting"
        for pdf in supporting_pdfs:
            if pdf.filename:
                saved = await save_upload(pdf, supp_dir)
                tender.supporting_doc_paths.append(saved)
        await _log(tender, "UPLOAD", f"{len(supporting_pdfs)} supporting docs uploaded")

    # BOQ Excel
    if boq_file and boq_file.filename:
        boq_path = await save_upload(boq_file, base / "boq")
        tender.boq_path = boq_path
        await _log(tender, "UPLOAD", f"BOQ: {boq_file.filename}")

    # Images
    if images:
        img_dir = base / "images"
        for img in images:
            if img.filename:
                await save_upload(img, img_dir)
        await _log(tender, "UPLOAD", f"{len(images)} image(s) uploaded")

    tender.status = "uploaded"
    tender.updated_at = datetime.utcnow()
    await tender.save()
    return tender


async def analyze_tender(tender: Tender) -> Tender:
    tender.status = "analyzing"
    tender.updated_at = datetime.utcnow()
    await tender.save()

    try:
        text = ""
        if tender.tender_pdf_path and os.path.exists(tender.tender_pdf_path):
            text = _extract_pdf_text(tender.tender_pdf_path)

        extracted = extract_tender_data(text)
        extracted["title"] = tender.title

        version = VersionEntry(
            version=1,
            summary="Initial AI extraction",
            data=extracted,
            timestamp=datetime.utcnow().isoformat(),
        )
        tender.version_history = [version]
        tender.extracted_data = extracted
        tender.status = "analyzed"
        tender.updated_at = datetime.utcnow()
        await tender.save()
        await _log(tender, "ANALYZED", "AI extraction completed")
        return tender
    except Exception as e:
        tender.status = "uploaded"
        await tender.save()
        await _log(tender, "ERROR", f"Analysis failed: {e}")
        raise HTTPException(500, f"Analysis failed: {e}")


async def apply_command(tender: Tender, command: str) -> dict:
    if not tender.extracted_data:
        raise HTTPException(400, "Tender must be analyzed before editing")

    updated_data, summary = process_ai_command(command, tender.extracted_data)

    version = VersionEntry(
        version=len(tender.version_history) + 1,
        command=command,
        summary=summary,
        data=updated_data,
        timestamp=datetime.utcnow().isoformat(),
    )
    tender.version_history.append(version)
    tender.extracted_data = updated_data
    tender.updated_at = datetime.utcnow()
    await tender.save()
    await _log(tender, "COMMAND", f"'{command}' → {summary}")
    return {"data": updated_data, "summary": summary}


async def generate_documents(tender: Tender) -> str:
    if not tender.extracted_data:
        raise HTTPException(400, "Tender must be analyzed before generating documents")

    tender.status = "generating"
    tender.updated_at = datetime.utcnow()
    await tender.save()

    try:
        tid = str(tender.id)
        out_dir = get_upload_path(tid, "output")
        data = tender.extracted_data

        cover_path      = str(out_dir / "Cover_Letter.pdf")
        compliance_path = str(out_dir / "Compliance.pdf")
        summary_path    = str(out_dir / "Summary.txt")

        generate_cover_letter(cover_path, data)
        generate_compliance_checklist(compliance_path, data)
        generate_summary_txt(summary_path, data, tender.title)

        # BOQ copy
        boq_dest = None
        if tender.boq_path and os.path.exists(tender.boq_path):
            boq_dest = str(out_dir / "BOQ.xlsx")
            shutil.copy2(tender.boq_path, boq_dest)

        # ZIP
        zip_path = str(get_upload_path(tid) / "Tender_Final.zip")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for fp in [cover_path, compliance_path, summary_path]:
                if os.path.exists(fp):
                    zf.write(fp, Path(fp).name)
            if boq_dest and os.path.exists(boq_dest):
                zf.write(boq_dest, "BOQ.xlsx")

            # Images folder
            img_src = get_upload_path(tid, "images")
            if img_src.exists():
                for img in img_src.iterdir():
                    if img.is_file():
                        zf.write(str(img), f"Images/{img.name}")

        tender.output_zip_path = zip_path
        tender.status = "completed"
        tender.updated_at = datetime.utcnow()
        await tender.save()
        await _log(tender, "GENERATED", "All documents generated and zipped")
        return zip_path

    except Exception as e:
        tender.status = "analyzed"
        await tender.save()
        await _log(tender, "ERROR", f"Generation failed: {e}")
        raise HTTPException(500, f"Document generation failed: {e}")
