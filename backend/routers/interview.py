import json
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db_connection
from services.ai_engine import ai_engine

router = APIRouter(prefix="/api/interview", tags=["interview"])

class StartInterviewRequest(BaseModel):
    interview_type: str = "Technical"
    difficulty: str = "Standard"
    target_role: str = "Data Analyst"

class AnswerTurnRequest(BaseModel):
    interview_id: str
    student_answer: str

@router.post("/start")
def start_interview(req: StartInterviewRequest, user_id: str = "usr_student_1"):
    interview_id = f"intv_{uuid.uuid4().hex[:8]}"
    conn = get_db_connection()

    total_turns = 5
    conn.execute("""
    INSERT INTO mock_interviews (
        id, user_id, target_role, interview_type, difficulty, total_turns, completed_turns, is_completed
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 0);
    """, (interview_id, user_id, req.target_role, req.interview_type, req.difficulty, total_turns))

    first_q = ai_engine.generate_interview_question(req.target_role, req.interview_type, 0)

    conn.execute("""
    INSERT INTO interview_turns (interview_id, turn_index, question, expected_skill)
    VALUES (?, 1, ?, ?);
    """, (interview_id, first_q["question"], first_q["expected_skill"]))

    conn.commit()
    conn.close()

    return {
        "interview_id": interview_id,
        "interview_type": req.interview_type,
        "target_role": req.target_role,
        "current_turn": 1,
        "total_turns": total_turns,
        "question": first_q["question"],
        "expected_skill": first_q["expected_skill"],
        "hint": first_q["hint"]
    }

@router.post("/answer")
def answer_turn(req: AnswerTurnRequest, user_id: str = "usr_student_1"):
    conn = get_db_connection()
    interview = conn.execute("SELECT * FROM mock_interviews WHERE id = ?", (req.interview_id,)).fetchone()
    if not interview:
        conn.close()
        raise HTTPException(status_code=404, detail="Interview not found")

    current_turns = conn.execute("SELECT * FROM interview_turns WHERE interview_id = ? ORDER BY turn_index ASC", (req.interview_id,)).fetchall()
    last_turn = current_turns[-1]

    eval_res = ai_engine.evaluate_interview_answer(last_turn["question"], req.student_answer, last_turn["expected_skill"])

    conn.execute("""
    UPDATE interview_turns
    SET student_answer = ?, turn_score = ?, accuracy_score = ?, relevance_score = ?,
        communication_score = ?, feedback = ?, follow_up_hint = ?
    WHERE id = ?;
    """, (
        req.student_answer, eval_res["score"], eval_res["accuracy_score"],
        eval_res["relevance_score"], eval_res["communication_score"],
        eval_res["feedback"], eval_res["follow_up_hint"], last_turn["id"]
    ))

    turn_count = len(current_turns)
    total_turns = interview["total_turns"]

    if turn_count < total_turns:
        next_turn_idx = turn_count + 1
        next_q = ai_engine.generate_interview_question(
            interview["target_role"], interview["interview_type"], turn_count, eval_res["score"]
        )

        conn.execute("""
        INSERT INTO interview_turns (interview_id, turn_index, question, expected_skill)
        VALUES (?, ?, ?, ?);
        """, (req.interview_id, next_turn_idx, next_q["question"], next_q["expected_skill"]))

        conn.execute("UPDATE mock_interviews SET completed_turns = ? WHERE id = ?", (turn_count, req.interview_id))
        conn.commit()
        conn.close()

        return {
            "interview_id": req.interview_id,
            "is_completed": False,
            "current_turn": next_turn_idx,
            "total_turns": total_turns,
            "turn_evaluation": eval_res,
            "next_question": next_q["question"],
            "expected_skill": next_q["expected_skill"],
            "hint": next_q["hint"]
        }
    else:
        all_turns = conn.execute("SELECT * FROM interview_turns WHERE interview_id = ?", (req.interview_id,)).fetchall()
        report = ai_engine.generate_interview_report([dict(t) for t in all_turns], interview["target_role"])

        conn.execute("""
        UPDATE mock_interviews
        SET completed_turns = ?, is_completed = 1, overall_score = ?,
            technical_score = ?, communication_score = ?, problem_solving_score = ?,
            project_knowledge_score = ?, confidence_score = ?, hr_readiness_score = ?,
            report_json = ?
        WHERE id = ?;
        """, (
            total_turns, report["overall_score"], report["technical_score"],
            report["communication_score"], report["problem_solving_score"],
            report["project_knowledge_score"], report["confidence_score"],
            report["hr_readiness_score"], json.dumps(report), req.interview_id
        ))

        conn.execute("""
        UPDATE student_profiles
        SET interview_readiness = MIN(94.0, interview_readiness + 4.0),
            placement_readiness = MIN(95.0, placement_readiness + 2.5),
            xp_points = xp_points + 200
        WHERE user_id = ?;
        """, (user_id,))

        conn.commit()
        conn.close()

        return {
            "interview_id": req.interview_id,
            "is_completed": True,
            "turn_evaluation": eval_res,
            "report": report
        }

@router.get("/report/{interview_id}")
def get_interview_report(interview_id: str):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM mock_interviews WHERE id = ?", (interview_id,)).fetchone()
    turns = conn.execute("SELECT * FROM interview_turns WHERE interview_id = ?", (interview_id,)).fetchall()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Interview not found")

    d = dict(row)
    d["report"] = json.loads(d.get("report_json") or "{}")
    d["turns"] = [dict(t) for t in turns]
    return d
