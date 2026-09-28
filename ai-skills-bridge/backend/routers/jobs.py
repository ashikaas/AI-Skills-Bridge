import json
from fastapi import APIRouter
from database import get_db_connection

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("/recommended")
def get_recommended_jobs(user_id: str = "usr_student_1"):
    conn = get_db_connection()
    skills = conn.execute("SELECT normalized_skill, score FROM student_skills WHERE user_id = ?", (user_id,)).fetchall()
    profile = conn.execute("SELECT target_role FROM student_profiles WHERE user_id = ?", (user_id,)).fetchone()
    target_role = profile["target_role"] if profile else "Data Analyst"

    student_skill_map = {s["normalized_skill"]: s["score"] for s in skills}

    jobs = conn.execute("SELECT * FROM job_descriptions WHERE role = ? LIMIT 10", (target_role,)).fetchall()
    conn.close()

    matched_jobs = []
    for j in jobs:
        req_skills = json.loads(j["skills_required"])
        match_count = 0
        missing = []
        for rs in req_skills:
            if student_skill_map.get(rs, 0) >= 50:
                match_count += 1
            else:
                missing.append(rs)

        skill_match_pct = int(round((match_count / (len(req_skills) or 1)) * 100))
        overall_match_pct = int(round(skill_match_pct * 0.85 + 10))

        matched_jobs.append({
            "id": j["id"],
            "company": j["company"],
            "role": j["role"],
            "location": j["location"],
            "industry": j["industry"],
            "experience_level": j["experience_level"],
            "salary_range": j["salary_range"],
            "description": j["description"],
            "skills_required": req_skills,
            "overall_match": min(95, max(60, overall_match_pct)),
            "skill_match": min(96, max(55, skill_match_pct)),
            "experience_match": 88,
            "project_match": 85,
            "missing_skills": missing[:2]
        })

    matched_jobs.sort(key=lambda x: x["overall_match"], reverse=True)
    return matched_jobs
