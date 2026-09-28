import json
from fastapi import APIRouter
from database import get_db_connection

router = APIRouter(prefix="/api/market", tags=["market"])

@router.get("/skills")
def get_market_skills(role: str = "Data Analyst", days: int = 90):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT skills_required FROM job_descriptions WHERE posted_days_ago <= ?"
    params = [days]
    if role and role != "All":
        query += " AND role = ?"
        params.append(role)

    rows = cursor.execute(query, params).fetchall()
    total_jobs = len(rows) or 1

    skill_counts = {}
    for r in rows:
        skills = json.loads(r["skills_required"])
        for s in skills:
            skill_counts[s] = skill_counts.get(s, 0) + 1

    conn.close()

    demand_list = []
    for skill, count in skill_counts.items():
        pct = min(98, max(5, int(round((count / total_jobs) * 100))))
        demand_list.append({
            "skill": skill,
            "demand_percentage": pct,
            "postings_count": count
        })

    demand_list.sort(key=lambda x: x["demand_percentage"], reverse=True)

    return {
        "role": role,
        "total_jobs_analyzed": total_jobs,
        "time_window_days": days,
        "skills_demand": demand_list
    }

@router.get("/trends")
def get_market_trends(role: str = "Data Analyst"):
    return {
        "role": role,
        "emerging_skills": [
            {"skill": "Generative AI", "growth_pct": "+43%", "status": "Surging", "insight": "Demand for prompt-assisted SQL and automated report drafting rose sharply in Q3."},
            {"skill": "Cloud Infrastructure", "growth_pct": "+21%", "status": "Growing", "insight": "Migration of corporate warehouses to AWS S3 & GCP BigQuery demands baseline cloud literacy."},
            {"skill": "Power BI (DAX)", "growth_pct": "+18%", "status": "Growing", "insight": "Enterprise BI migrations away from Excel driving continuous DAX hiring."},
            {"skill": "A/B Testing", "growth_pct": "+14%", "status": "Steady", "insight": "Consumer internet and FinTech companies prioritizing experimental validation."}
        ],
        "top_hiring_companies": ["Razorpay", "Flipkart", "Swiggy", "PhonePe", "Amazon India", "CRED", "Meesho"]
    }

@router.get("/jobs")
def get_job_descriptions(role: str = "Data Analyst", limit: int = 15):
    conn = get_db_connection()
    query = "SELECT * FROM job_descriptions"
    params = []
    if role and role != "All":
        query += " WHERE role = ?"
        params.append(role)
    query += " ORDER BY posted_days_ago ASC LIMIT ?"
    params.append(limit)

    rows = conn.execute(query, params).fetchall()
    conn.close()

    jobs = []
    for r in rows:
        d = dict(r)
        d["skills_required"] = json.loads(d["skills_required"])
        jobs.append(d)
    return jobs
