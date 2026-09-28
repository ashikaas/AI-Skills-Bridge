import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db_connection

router = APIRouter(prefix="/api/student", tags=["student"])

class TargetRoleUpdate(BaseModel):
    target_role: str

@router.get("/profile")
def get_student_profile(user_id: str = "usr_student_1"):
    conn = get_db_connection()
    profile = conn.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,)).fetchone()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    projects = conn.execute("SELECT * FROM student_projects WHERE user_id = ?", (user_id,)).fetchall()
    badges = conn.execute("SELECT * FROM student_badges WHERE user_id = ?", (user_id,)).fetchall()
    conn.close()

    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    p_dict = dict(profile)
    p_dict["preferred_industries"] = json.loads(p_dict.get("preferred_industries") or "[]")
    p_dict["name"] = user["name"]
    p_dict["email"] = user["email"]
    p_dict["avatar_url"] = user["avatar_url"]

    formatted_projects = []
    for prj in projects:
        d = dict(prj)
        d["technologies"] = json.loads(d.get("technologies") or "[]")
        d["highlights"] = json.loads(d.get("highlights") or "[]")
        formatted_projects.append(d)
    p_dict["projects"] = formatted_projects

    p_dict["badges"] = [dict(b) for b in badges]
    return p_dict

from services.ai_engine import ai_engine

@router.post("/target-role")
def update_target_role(req: TargetRoleUpdate, user_id: str = "usr_student_1"):
    conn = get_db_connection()
    try:
        ai_engine.sync_student_data_for_role(conn, user_id, req.target_role)
    finally:
        conn.close()
    return {"message": f"Target role updated to {req.target_role}", "target_role": req.target_role}

@router.get("/dashboard")
def get_student_dashboard(user_id: str = "usr_student_1"):
    conn = get_db_connection()
    profile = conn.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,)).fetchone()
    notifications = conn.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5", (user_id,)).fetchall()
    conn.close()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    recommendations = [
        {"title": "Advanced SQL & CTEs", "priority": "High Priority", "tag": "Core Requirement", "desc": "Required in 92% of listings. Master window functions and query plans."},
        {"title": "Inferential Statistics", "priority": "High Priority", "tag": "Analytical Rigor", "desc": "61% market demand. Strengthen hypothesis testing & p-value calculations."},
        {"title": "Power BI & DAX Modeling", "priority": "Medium Priority", "tag": "Visualization", "desc": "Closes a 24-point skill gap. Complete DAX Context Transition drills."},
        {"title": "GenAI for Analytics", "priority": "Emerging Skill", "tag": "+43% Trend", "desc": "Fastest growing demand in Q3. Learn prompt engineering for automated reporting."}
    ]

    return {
        "placement_readiness": profile["placement_readiness"],
        "market_alignment": profile["market_alignment"],
        "skill_mastery": profile["skill_mastery"],
        "project_readiness": profile["project_readiness"],
        "interview_readiness": profile["interview_readiness"],
        "streak_days": profile["streak_days"],
        "xp_points": profile["xp_points"],
        "level": profile["level"],
        "target_role": profile["target_role"],
        "ai_recommendations": recommendations,
        "market_update": "GenAI requirements for Data Analyst roles increased 17% in the latest market scan across 112 job descriptions.",
        "notifications": [dict(n) for n in notifications]
    }
