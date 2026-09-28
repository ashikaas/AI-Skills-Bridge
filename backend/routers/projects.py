import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db_connection
from services.ai_engine import ai_engine

router = APIRouter(prefix="/api/projects", tags=["projects"])

class ProjectSubmitRequest(BaseModel):
    challenge_id: str
    submission_text: str
    code_solution: str
    repo_link: str

@router.get("/challenges")
def get_industry_challenges():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM industry_challenges").fetchall()
    conn.close()

    challenges = []
    for r in rows:
        d = dict(r)
        d["tasks"] = json.loads(d.get("tasks_json") or "[]")
        d["dataset_sample"] = json.loads(d.get("dataset_sample_json") or "[]")
        d["rubric"] = json.loads(d.get("rubric_json") or "{}")
        challenges.append(d)
    return challenges

@router.post("/submit")
def submit_industry_project(req: ProjectSubmitRequest, user_id: str = "usr_student_1"):
    conn = get_db_connection()
    ch = conn.execute("SELECT * FROM industry_challenges WHERE id = ?", (req.challenge_id,)).fetchone()
    if not ch:
        conn.close()
        raise HTTPException(status_code=404, detail="Challenge not found")

    evaluation = ai_engine.evaluate_industry_project(req.submission_text, req.code_solution, req.repo_link)

    conn.execute("""
    INSERT INTO challenge_submissions (
        user_id, challenge_id, submission_text, code_solution, repo_link,
        overall_score, technical_score, analysis_score, business_score,
        problem_solving_score, communication_score, visualization_score, feedback
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id, req.challenge_id, req.submission_text, req.code_solution, req.repo_link,
        evaluation["overall_score"], evaluation["technical_score"], evaluation["analysis_score"],
        evaluation["business_score"], evaluation["problem_solving_score"],
        evaluation["communication_score"], evaluation["visualization_score"],
        evaluation["feedback"]
    ))

    conn.execute("""
    UPDATE student_profiles
    SET project_readiness = MIN(96.0, project_readiness + 3.5),
        placement_readiness = MIN(95.0, placement_readiness + 2.0),
        xp_points = xp_points + 250
    WHERE user_id = ?
    """, (user_id,))

    conn.commit()
    conn.close()

    return evaluation
