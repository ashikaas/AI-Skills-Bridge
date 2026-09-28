from fastapi import APIRouter
from pydantic import BaseModel
from database import get_db_connection
from services.ai_engine import ai_engine

router = APIRouter(prefix="/api/copilot", tags=["copilot"])

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def copilot_chat(req: ChatRequest, user_id: str = "usr_student_1"):
    conn = get_db_connection()
    profile = conn.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,)).fetchone()
    skills = conn.execute("SELECT * FROM student_skills WHERE user_id = ?", (user_id,)).fetchall()
    conn.close()

    prof_dict = dict(profile) if profile else {"target_role": "Data Analyst", "placement_readiness": 78}
    skill_list = [dict(s) for s in skills]

    reply = ai_engine.career_copilot_chat(req.message, prof_dict, skill_list)
    return {"reply": reply}
