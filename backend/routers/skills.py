import json
from fastapi import APIRouter
from database import get_db_connection
from services.ai_engine import ai_engine

router = APIRouter(prefix="/api/skills", tags=["skills"])

@router.get("/gaps")
def get_skill_gaps(user_id: str = "usr_student_1"):
    conn = get_db_connection()
    skills = conn.execute("SELECT * FROM student_skills WHERE user_id = ?", (user_id,)).fetchall()
    profile = conn.execute("SELECT target_role FROM student_profiles WHERE user_id = ?", (user_id,)).fetchone()
    
    target_role = profile["target_role"] if profile else "Data Analyst"
    jds = conn.execute("SELECT skills_required FROM job_descriptions WHERE role = ?", (target_role,)).fetchall()
    conn.close()

    total_jds = len(jds)
    skill_demand = {}
    if total_jds > 0:
        for jd in jds:
            req = json.loads(jd["skills_required"])
            for s in req:
                skill_demand[s] = skill_demand.get(s, 0) + 1
        market_pcts = {s: min(98, max(5, int(round((c / total_jds) * 100)))) for s, c in skill_demand.items()}
    else:
        market_pcts = {}

    student_skills_list = [dict(s) for s in skills]
    gap_analysis = ai_engine.calculate_skill_gaps(student_skills_list, market_pcts, target_role)

    top_gap = gap_analysis[0]["skill"] if gap_analysis else "Core Competency"
    summary_narrative = (
        f"Your highest-impact gap for {target_role} is {top_gap} because the skill has high market demand "
        f"and your current verified evidence is limited. "
        f"Completing your 30-Day {target_role} Dynamic Extra Track will close this gap directly."
    )

    return {
        "target_role": target_role,
        "gaps": gap_analysis,
        "summary_narrative": summary_narrative
    }

@router.get("/passport")
def get_skill_passport(user_id: str = "usr_student_1"):
    conn = get_db_connection()
    skills = conn.execute("SELECT * FROM student_skills WHERE user_id = ? ORDER BY mastery_percentage DESC", (user_id,)).fetchall()
    profile = conn.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,)).fetchone()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    passport_skills = []
    for s in skills:
        d = dict(s)
        d["evidence_breakdown"] = {
            "learn": {"completed": d["learn_score"] >= 60, "score": d["learn_score"]},
            "practice": {"completed": d["practice_score"] >= 60, "score": d["practice_score"]},
            "project": {"completed": d["do_score"] >= 60, "score": d["do_score"]},
            "interview": {"completed": d["interview_score"] >= 60, "score": d["interview_score"]}
        }
        passport_skills.append(d)

    return {
        "passport_id": f"PASSPORT-IND-2026-{user_id[-4:]}",
        "student_name": user["name"] if user else "Ashwin Kumar",
        "university": profile["university"] if profile else "IITM",
        "target_role": profile["target_role"] if profile else "Data Analyst",
        "verified_date": "September 2026",
        "skills": passport_skills
    }
