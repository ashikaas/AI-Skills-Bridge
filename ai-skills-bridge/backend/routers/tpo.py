import json
from fastapi import APIRouter
from pydantic import BaseModel
from database import get_db_connection

router = APIRouter(prefix="/api/tpo", tags=["tpo"])

class InterventionCreateRequest(BaseModel):
    title: str
    target_department: str
    target_skill: str
    affected_students_count: int
    market_demand_pct: int
    curriculum_weeks: int = 4
    expected_readiness_boost: float = 20.0

@router.get("/dashboard")
def get_tpo_dashboard():
    conn = get_db_connection()
    students = conn.execute("SELECT * FROM cohort_students").fetchall()
    interventions = conn.execute("SELECT * FROM tpo_interventions ORDER BY created_at DESC").fetchall()
    conn.close()

    total = len(students)
    ready = sum(1 for s in students if s["placement_ready"])
    at_risk = sum(1 for s in students if s["is_at_risk"])
    avg_readiness = round(sum(s["readiness_score"] for s in students) / (total or 1), 1)
    avg_skill = round(sum(s["skill_score"] for s in students) / (total or 1), 1)
    avg_interview = round(sum(s["interview_score"] for s in students) / (total or 1), 1)

    dept_stats = {}
    for s in students:
        d = s["department"]
        if d not in dept_stats:
            dept_stats[d] = {"total": 0, "ready": 0, "sum_readiness": 0}
        dept_stats[d]["total"] += 1
        if s["placement_ready"]:
            dept_stats[d]["ready"] += 1
        dept_stats[d]["sum_readiness"] += s["readiness_score"]

    department_breakdown = []
    for d, stats in dept_stats.items():
        department_breakdown.append({
            "department": d,
            "total_students": stats["total"],
            "ready_percentage": int(round((stats["ready"] / (stats["total"] or 1)) * 100)),
            "average_readiness": round(stats["sum_readiness"] / (stats["total"] or 1), 1)
        })

    readiness_distribution = [
        {"range": "0-40% (At Risk)", "count": sum(1 for s in students if s["readiness_score"] < 40)},
        {"range": "41-60% (Developing)", "count": sum(1 for s in students if 40 <= s["readiness_score"] < 60)},
        {"range": "61-75% (Near Ready)", "count": sum(1 for s in students if 60 <= s["readiness_score"] < 75)},
        {"range": "76-90% (Placement Ready)", "count": sum(1 for s in students if 75 <= s["readiness_score"] < 90)},
        {"range": "91-100% (High Performer)", "count": sum(1 for s in students if s["readiness_score"] >= 90)}
    ]

    return {
        "total_students": total,
        "placement_ready_pct": int(round((ready / (total or 1)) * 100)),
        "market_aligned_pct": 74,
        "average_skill_score": avg_skill,
        "average_interview_score": avg_interview,
        "students_at_risk": at_risk,
        "department_breakdown": department_breakdown,
        "readiness_distribution": readiness_distribution,
        "active_interventions": [dict(i) for i in interventions]
    }

@router.get("/heatmap")
def get_tpo_heatmap():
    conn = get_db_connection()
    students = conn.execute("SELECT department, skills_json FROM cohort_students").fetchall()
    conn.close()

    skills = ["Python", "SQL", "Cloud", "Generative AI", "Power BI", "Machine Learning"]
    departments = ["AIML", "CSE", "IT", "ECE"]

    matrix = {d: {s: [] for s in skills} for d in departments}

    for st in students:
        d = st["department"]
        if d in matrix:
            sk_map = json.loads(st["skills_json"])
            for s in skills:
                if s in sk_map:
                    matrix[d][s].append(sk_map[s])

    heatmap_data = []
    for d in departments:
        row = {"department": d}
        for s in skills:
            vals = matrix[d][s]
            avg_val = int(round(sum(vals) / len(vals))) if vals else 50
            row[s] = avg_val
        heatmap_data.append(row)

    return {"skills": skills, "departments": departments, "matrix": heatmap_data}

@router.post("/intervention")
def create_intervention(req: InterventionCreateRequest, tpo_id: str = "usr_tpo_1"):
    import uuid
    intv_id = f"intv_{uuid.uuid4().hex[:6]}"
    conn = get_db_connection()
    conn.execute("""
    INSERT INTO tpo_interventions (
        id, tpo_user_id, title, target_department, target_skill,
        affected_students_count, market_demand_pct, curriculum_weeks, status, expected_readiness_boost
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?);
    """, (
        intv_id, tpo_id, req.title, req.target_department, req.target_skill,
        req.affected_students_count, req.market_demand_pct, req.curriculum_weeks, req.expected_readiness_boost
    ))
    conn.commit()
    conn.close()

    return {"message": "University intervention deployed successfully", "id": intv_id}

@router.get("/students")
def get_cohort_students(department: str = "All", at_risk: bool = False):
    conn = get_db_connection()
    query = "SELECT * FROM cohort_students"
    params = []
    conditions = []
    if department != "All":
        conditions.append("department = ?")
        params.append(department)
    if at_risk:
        conditions.append("is_at_risk = 1")

    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY readiness_score DESC"

    rows = conn.execute(query, params).fetchall()
    conn.close()

    students = []
    for r in rows:
        d = dict(r)
        d["skills"] = json.loads(d["skills_json"])
        students.append(d)
    return students
