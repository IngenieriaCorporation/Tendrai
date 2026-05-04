import json
import logging
import copy
import re
from openai import OpenAI
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

EXTRACTION_PROMPT = """You are an expert government tender document analyzer for India.
Extract structured information from the tender document text provided.

Return ONLY a valid JSON object with exactly these keys:
{
  "eligibility": "overall eligibility criteria summary as a single string",
  "certificates_required": ["list", "of", "required", "certificates"],
  "emd": "Earnest Money Deposit amount and payment details",
  "turnover": "minimum annual turnover requirement",
  "experience": "work experience requirement",
  "important_dates": [
    {"event": "event name", "date": "DD-MM-YYYY or date string"}
  ],
  "technical_requirements": ["list", "of", "technical", "requirements"]
}

Rules:
- Use empty string "" for missing text fields
- Use empty list [] for missing list fields
- Do NOT include markdown, code fences, or any text outside the JSON
- Be precise and extract actual values from the document"""

COMMAND_PROMPT = """You are a tender data editing assistant. Apply the user's natural language command to modify the tender JSON data.

Current tender data:
{current_data}

User command: "{command}"

Instructions:
- Apply the change intelligently
- If command says "change X to Y" — update the relevant field
- If command says "add X" — append to the relevant list
- If command says "remove X" — remove from the relevant list or set to empty/exempted
- Keep all other fields exactly the same

Return ONLY a valid JSON object with exactly these two keys:
{
  "updated_data": <the complete updated tender data>,
  "change_summary": "one sentence describing what changed"
}

No markdown, no code fences, only raw JSON."""


def extract_tender_data(text: str) -> dict:
    if not settings.OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not set — returning mock extraction data")
        return _mock_extraction()
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        truncated = text[:14000]
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": EXTRACTION_PROMPT},
                {"role": "user", "content": f"Extract from this tender:\n\n{truncated}"},
            ],
            temperature=0.1,
            max_tokens=2000,
        )
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error in AI extraction: {e}")
        return _mock_extraction()
    except Exception as e:
        logger.error(f"OpenAI extraction error: {e}")
        return _mock_extraction()


def process_ai_command(command: str, current_data: dict) -> tuple:
    if not settings.OPENAI_API_KEY:
        return _fallback_command(command, current_data)
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        prompt = COMMAND_PROMPT.format(
            current_data=json.dumps(current_data, indent=2),
            command=command,
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2000,
        )
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)
        return result.get("updated_data", current_data), result.get("change_summary", "Data updated")
    except Exception as e:
        logger.error(f"AI command error: {e}")
        return _fallback_command(command, current_data)


def _mock_extraction() -> dict:
    return {
        "eligibility": "Indian registered firm/company with valid GST and PAN registration. Minimum 3 years in similar work.",
        "certificates_required": [
            "GST Registration Certificate",
            "PAN Card",
            "ISO 9001:2015 Certificate",
            "Labour License",
            "EPFO Registration",
            "ESIC Registration",
        ],
        "emd": "₹2,50,000 (Two Lakh Fifty Thousand) payable via DD / NEFT / RTGS in favour of the Executing Authority",
        "turnover": "Minimum ₹1 Crore annual turnover for last 3 consecutive financial years",
        "experience": "Minimum 3 completed similar projects in last 5 years with at least one project of value not less than 40% of estimated cost",
        "important_dates": [
            {"event": "Tender Document Download Start", "date": "01-06-2025"},
            {"event": "Pre-Bid Meeting", "date": "10-06-2025"},
            {"event": "Last Date for Bid Submission", "date": "25-06-2025"},
            {"event": "Technical Bid Opening", "date": "26-06-2025"},
            {"event": "Financial Bid Opening", "date": "28-06-2025"},
        ],
        "technical_requirements": [
            "Minimum 10 skilled workers on permanent payroll",
            "Own machinery and equipment for the scope of work",
            "Valid electrical contractor license from State Electricity Board",
            "No blacklisting by any Government body in last 5 years",
            "Solvency certificate from Nationalized Bank",
        ],
    }


def _fallback_command(command: str, current_data: dict) -> tuple:
    updated = copy.deepcopy(current_data)
    cmd = command.lower().strip()

    # Turnover change
    if "turnover" in cmd:
        numbers = re.findall(r"\d+(?:\.\d+)?", command)
        unit = "crore" if "crore" in cmd else "lakh" if "lakh" in cmd else ""
        if numbers:
            updated["turnover"] = f"Minimum ₹{numbers[0]} {unit} annual turnover".strip()
            return updated, f"Updated turnover to ₹{numbers[0]} {unit}"

    # Add certificate
    if "add" in cmd and ("cert" in cmd or "iso" in cmd or "license" in cmd or "licence" in cmd):
        words = command.split()
        try:
            idx = next(i for i, w in enumerate(words) if w.lower() in ("add", "include"))
            cert = " ".join(words[idx + 1:])
        except StopIteration:
            cert = command.replace("add", "").strip()
        certs = updated.get("certificates_required", [])
        certs.append(cert.strip())
        updated["certificates_required"] = certs
        return updated, f"Added certificate: {cert.strip()}"

    # Remove EMD
    if "remove" in cmd and "emd" in cmd:
        updated["emd"] = "EMD Exempted as per tender corrigendum"
        return updated, "EMD requirement removed/exempted"

    # Change EMD amount
    if "emd" in cmd and any(w in cmd for w in ["change", "update", "set"]):
        numbers = re.findall(r"\d+(?:,\d+)*", command)
        if numbers:
            updated["emd"] = f"₹{numbers[0]} payable via DD / NEFT / RTGS"
            return updated, f"Updated EMD to ₹{numbers[0]}"

    # Change experience
    if "experience" in cmd or "years" in cmd:
        numbers = re.findall(r"\d+", command)
        if numbers:
            updated["experience"] = f"Minimum {numbers[0]} completed similar projects required"
            return updated, f"Updated experience requirement"

    return updated, f"Command noted (add OPENAI_API_KEY for full AI processing): '{command}'"
