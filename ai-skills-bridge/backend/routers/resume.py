import io
import re
from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from services.ai_engine import ai_engine

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    from docx import Document
except ImportError:
    Document = None

router = APIRouter(prefix="/api/resume", tags=["resume"])

DEMO_RESUME_TEXT = """
Ashwin Kumar
B.Tech in Artificial Intelligence & Machine Learning (3rd Year, CGPA 8.7)
Indian Institute of Technology & Management

SUMMARY
Driven analytical technologist with proven experience designing data pipelines, training ML models, and deploying automated analytics dashboards. Experienced in Python, SQL, Excel, and generative AI prompt workflows.

TECHNICAL SKILLS
- Programming: Python (Pandas, NumPy, Scikit-learn, Streamlit, SciPy), SQL (PostgreSQL, SQLite), Bash
- Analytics & BI: Microsoft Excel (VLOOKUP, Pivot Tables, Advanced Macros), Power BI (Basic visual reports, bar charts), Tableau
- Statistical Methods: Descriptive statistics, hypothesis testing basics, A/B test theory
- Database & Modeling: Normalized schema design, star schemas, window functions, CTEs

PROJECTS
1. E-commerce Product Growth Analytics Dashboard
- Engineered an end-to-end customer cohort retention pipeline processing 150K+ transactional records using Python, Pandas and PostgreSQL.
- Implemented RFM segmentation to isolate top churn drivers, achieving an estimated 14% conversion optimization.
- Built interactive Streamlit dashboard with retention heatmaps for executive stakeholder presentations.

2. AI-Powered Data Analyst Assistant
- Developed an LLM-assisted conversational analytics assistant using Python, LangChain, SQLite, and OpenAI API.
- Implemented few-shot prompt chaining to automatically translate English business queries into valid SQL queries with 91% accuracy.
- Enforced read-only security sandboxing to prevent unsafe database modifications.
"""

def extract_text_from_upload(content: bytes, filename: str) -> str:
    """
    Safely extracts readable plain text from PDF, DOCX, or TXT uploads.
    Filters out raw binary streams, compression artifacts, and SSL certificates.
    """
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    extracted = ""

    # 1. PDF extraction using pypdf
    if ext == "pdf" or content.startswith(b"%PDF"):
        if PdfReader:
            try:
                reader = PdfReader(io.BytesIO(content))
                pages_text = []
                for page in reader.pages:
                    p_text = page.extract_text()
                    if p_text:
                        pages_text.append(p_text)
                extracted = "\n".join(pages_text)
            except Exception as e:
                extracted = ""
        else:
            extracted = ""

    # 2. DOCX extraction
    elif ext in ["docx", "doc"]:
        if Document:
            try:
                doc = Document(io.BytesIO(content))
                extracted = "\n".join([p.text for p in doc.paragraphs if p.text])
            except Exception as e:
                extracted = ""
        else:
            extracted = ""

    # 3. Plain text fallback
    else:
        for enc in ["utf-8", "latin-1", "cp1252"]:
            try:
                extracted = content.decode(enc)
                break
            except UnicodeDecodeError:
                continue

    # Clean text: remove non-printable control chars, null bytes, X.509 cert garbage
    cleaned = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f-\x9f]', ' ', extracted)
    cleaned = re.sub(r'[^\x20-\x7E\n\r\t]', ' ', cleaned)  # Keep standard ASCII readable text
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)
    cleaned = re.sub(r'\n\s*\n', '\n', cleaned).strip()

    return cleaned

@router.post("/analyze")
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    use_demo: bool = Form(True),
    target_role: str = Form("Data Analyst")
):
    print(f"[RESUME] target_role='{target_role}' | use_demo={use_demo} | file={'YES' if file else 'NO'}", flush=True)
    text = DEMO_RESUME_TEXT
    is_uploaded = False

    if file and not use_demo:
        try:
            content = await file.read()
            extracted = extract_text_from_upload(content, file.filename or "resume.txt")
            if len(extracted.strip()) >= 50:
                text = extracted
                is_uploaded = True
            else:
                # File gave no readable text (scanned PDF etc) — fall back to demo
                print(f"[RESUME] File gave no readable text, falling back to demo mode", flush=True)
                text = DEMO_RESUME_TEXT
        except Exception:
            text = DEMO_RESUME_TEXT

    analysis = ai_engine.extract_resume_skills(text, target_role, is_custom_upload=is_uploaded)
    print(f"[RESUME] ATS={analysis['ats_compatibility_score']}% Quality={analysis['resume_quality_score']}%", flush=True)

    try:
        from database import get_db_connection
        conn = get_db_connection()
        ai_engine.sync_student_data_for_role(conn, "usr_student_1", target_role, analysis.get("extracted_skills"))
        conn.close()
    except Exception as err:
        print(f"[RESUME SYNC ERROR] {err}", flush=True)

    return analysis
