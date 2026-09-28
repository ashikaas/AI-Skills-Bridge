import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db_connection

router = APIRouter(prefix="/api/tracks", tags=["tracks"])

class ModuleCompleteRequest(BaseModel):
    module_id: str

@router.get("/current")
def get_current_track(user_id: str = "usr_student_1"):
    conn = get_db_connection()
    track = conn.execute("SELECT * FROM extra_tracks WHERE user_id = ? AND is_active = 1", (user_id,)).fetchone()
    if not track:
        conn.close()
        raise HTTPException(status_code=404, detail="Active track not found")

    modules = conn.execute("SELECT * FROM track_modules WHERE track_id = ? ORDER BY week_number ASC, type ASC", (track["id"],)).fetchall()
    conn.close()

    weeks = {1: [], 2: [], 3: [], 4: []}
    week_themes = {}
    for m in modules:
        d = dict(m)
        d["content"] = json.loads(d.get("content_json") or "{}")
        w_num = d["week_number"]
        if w_num in weeks:
            weeks[w_num].append(d)
        week_themes[w_num] = d.get("theme", f"Week {w_num} Mastery")

    return {
        "track": dict(track),
        "weeks": [
            {"week": w, "theme": week_themes.get(w, f"Week {w} Mastery"), "modules": weeks.get(w, [])}
            for w in range(1, 5)
        ]
    }

@router.post("/complete-module")
def complete_module(req: ModuleCompleteRequest, user_id: str = "usr_student_1"):
    conn = get_db_connection()
    mod = conn.execute("SELECT * FROM track_modules WHERE id = ?", (req.module_id,)).fetchone()
    if not mod:
        conn.close()
        raise HTTPException(status_code=404, detail="Module not found")

    new_status = 0 if mod["is_completed"] else 1
    completed_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if new_status == 1 else None

    conn.execute("UPDATE track_modules SET is_completed = ?, completed_at = ? WHERE id = ?", (new_status, completed_time, req.module_id))

    track_id = mod["track_id"]
    total = conn.execute("SELECT COUNT(*) as c FROM track_modules WHERE track_id = ?", (track_id,)).fetchone()["c"]
    completed = conn.execute("SELECT COUNT(*) as c FROM track_modules WHERE track_id = ? AND is_completed = 1", (track_id,)).fetchone()["c"]
    progress = round((completed / (total or 1)) * 100.0, 1)

    conn.execute("UPDATE extra_tracks SET completed_modules = ?, overall_progress = ? WHERE id = ?", (completed, progress, track_id))

    if new_status == 1:
        conn.execute("UPDATE student_profiles SET xp_points = xp_points + 100, placement_readiness = MIN(95.0, placement_readiness + 0.8) WHERE user_id = ?", (user_id,))

    conn.commit()
    conn.close()

    return {
        "module_id": req.module_id,
        "is_completed": bool(new_status),
        "track_progress": progress,
        "completed_count": completed,
        "total_count": total,
        "xp_earned": 100 if new_status == 1 else 0
    }
