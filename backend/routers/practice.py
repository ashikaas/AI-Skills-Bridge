import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db_connection
from services.ai_engine import ai_engine

router = APIRouter(prefix="/api/practice", tags=["practice"])

class SubmitAnswerRequest(BaseModel):
    challenge_id: str
    submitted_answer: str

@router.get("/challenges")
def get_practice_challenges():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM practice_challenges").fetchall()
    conn.close()

    challenges = []
    for r in rows:
        d = dict(r)
        d["hints"] = json.loads(d.get("hints") or "[]")
        try:
            d["sample_data"] = json.loads(d.get("sample_data_json") or "[]")
        except:
            d["sample_data"] = []
        challenges.append(d)
    return challenges

@router.post("/submit")
def submit_practice_answer(req: SubmitAnswerRequest, user_id: str = "usr_student_1"):
    conn = get_db_connection()
    ch = conn.execute("SELECT * FROM practice_challenges WHERE id = ?", (req.challenge_id,)).fetchone()
    if not ch:
        conn.close()
        raise HTTPException(status_code=404, detail="Challenge not found")

    ch_dict = dict(ch)
    eval_result = ai_engine.evaluate_practice_answer(ch["type"], req.submitted_answer, ch_dict)

    conn.execute("""
    INSERT INTO practice_attempts (
        user_id, challenge_id, submitted_answer, score, correctness_score,
        concept_score, efficiency_score, feedback
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id, req.challenge_id, req.submitted_answer, eval_result["score"],
        eval_result["correctness_score"], eval_result["concept_score"],
        eval_result["efficiency_score"], eval_result["feedback"]
    ))

    conn.execute("UPDATE student_profiles SET xp_points = xp_points + 75 WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()

    return eval_result
