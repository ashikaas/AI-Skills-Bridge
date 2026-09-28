import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = Path(__file__).resolve().parent / "skillsbridge.db"

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Student Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_profiles (
        user_id TEXT PRIMARY KEY,
        university TEXT NOT NULL,
        degree TEXT NOT NULL,
        branch TEXT NOT NULL,
        year INTEGER NOT NULL,
        cgpa REAL DEFAULT 8.4,
        target_role TEXT NOT NULL DEFAULT 'Data Analyst',
        preferred_industries TEXT,
        streak_days INTEGER DEFAULT 14,
        xp_points INTEGER DEFAULT 3450,
        level INTEGER DEFAULT 7,
        placement_readiness REAL DEFAULT 78.0,
        market_alignment REAL DEFAULT 82.0,
        skill_mastery REAL DEFAULT 76.0,
        project_readiness REAL DEFAULT 85.0,
        interview_readiness REAL DEFAULT 68.0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 3. Student Skills
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        normalized_skill TEXT NOT NULL,
        proficiency_level TEXT NOT NULL,
        score INTEGER NOT NULL,
        learn_score INTEGER DEFAULT 0,
        practice_score INTEGER DEFAULT 0,
        do_score INTEGER DEFAULT 0,
        interview_score INTEGER DEFAULT 0,
        mastery_percentage REAL DEFAULT 0.0,
        evidence_summary TEXT,
        status TEXT DEFAULT 'Developing',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 4. Student Projects
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        technologies TEXT NOT NULL,
        github_url TEXT,
        live_demo_url TEXT,
        highlights TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 5. Job Descriptions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS job_descriptions (
        id TEXT PRIMARY KEY,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT NOT NULL,
        industry TEXT NOT NULL,
        experience_level TEXT NOT NULL,
        salary_range TEXT,
        skills_required TEXT NOT NULL,
        description TEXT NOT NULL,
        posted_days_ago INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. Extra Tracks
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS extra_tracks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        target_role TEXT NOT NULL,
        title TEXT NOT NULL,
        duration_weeks INTEGER DEFAULT 4,
        total_modules INTEGER DEFAULT 12,
        completed_modules INTEGER DEFAULT 5,
        overall_progress REAL DEFAULT 41.6,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 7. Track Modules
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS track_modules (
        id TEXT PRIMARY KEY,
        track_id TEXT NOT NULL,
        week_number INTEGER NOT NULL,
        theme TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        associated_skill TEXT NOT NULL,
        estimated_minutes INTEGER DEFAULT 45,
        is_completed BOOLEAN DEFAULT 0,
        completed_at TIMESTAMP,
        content_json TEXT,
        FOREIGN KEY(track_id) REFERENCES extra_tracks(id) ON DELETE CASCADE
    );
    """)

    # 8. Practice Challenges & Attempts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS practice_challenges (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        skill TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        type TEXT NOT NULL,
        prompt TEXT NOT NULL,
        starter_code TEXT,
        sample_data_json TEXT,
        expected_concept TEXT,
        hints TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS practice_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        challenge_id TEXT NOT NULL,
        submitted_answer TEXT NOT NULL,
        score INTEGER NOT NULL,
        correctness_score INTEGER NOT NULL,
        concept_score INTEGER NOT NULL,
        efficiency_score INTEGER NOT NULL,
        feedback TEXT NOT NULL,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(challenge_id) REFERENCES practice_challenges(id)
    );
    """)

    # 9. Industry Challenges & Submissions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS industry_challenges (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        domain TEXT NOT NULL,
        target_role TEXT NOT NULL,
        overview TEXT NOT NULL,
        tasks_json TEXT NOT NULL,
        dataset_description TEXT NOT NULL,
        dataset_sample_json TEXT NOT NULL,
        rubric_json TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS challenge_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        challenge_id TEXT NOT NULL,
        submission_text TEXT,
        code_solution TEXT,
        repo_link TEXT,
        overall_score INTEGER NOT NULL,
        technical_score INTEGER NOT NULL,
        analysis_score INTEGER NOT NULL,
        business_score INTEGER NOT NULL,
        problem_solving_score INTEGER NOT NULL,
        communication_score INTEGER NOT NULL,
        visualization_score INTEGER NOT NULL,
        feedback TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(challenge_id) REFERENCES industry_challenges(id)
    );
    """)

    # 10. AI Mock Interviews
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mock_interviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        target_role TEXT NOT NULL,
        interview_type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        total_turns INTEGER DEFAULT 5,
        completed_turns INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT 0,
        overall_score INTEGER DEFAULT 0,
        technical_score INTEGER DEFAULT 0,
        communication_score INTEGER DEFAULT 0,
        problem_solving_score INTEGER DEFAULT 0,
        project_knowledge_score INTEGER DEFAULT 0,
        confidence_score INTEGER DEFAULT 0,
        hr_readiness_score INTEGER DEFAULT 0,
        report_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interview_turns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        interview_id TEXT NOT NULL,
        turn_index INTEGER NOT NULL,
        question TEXT NOT NULL,
        expected_skill TEXT,
        student_answer TEXT,
        turn_score INTEGER,
        accuracy_score INTEGER,
        relevance_score INTEGER,
        communication_score INTEGER,
        feedback TEXT,
        follow_up_hint TEXT,
        FOREIGN KEY(interview_id) REFERENCES mock_interviews(id) ON DELETE CASCADE
    );
    """)

    # 11. Student Badges
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        badge_name TEXT NOT NULL,
        badge_title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 12. Notifications
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 13. TPO Interventions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tpo_interventions (
        id TEXT PRIMARY KEY,
        tpo_user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        target_department TEXT NOT NULL,
        target_skill TEXT NOT NULL,
        affected_students_count INTEGER NOT NULL,
        market_demand_pct INTEGER NOT NULL,
        curriculum_weeks INTEGER DEFAULT 4,
        status TEXT DEFAULT 'Active',
        expected_readiness_boost REAL DEFAULT 18.5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tpo_user_id) REFERENCES users(id)
    );
    """)

    # 14. Cohort Students
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cohort_students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        year INTEGER NOT NULL,
        target_role TEXT NOT NULL,
        placement_ready BOOLEAN DEFAULT 0,
        readiness_score INTEGER NOT NULL,
        market_alignment INTEGER NOT NULL,
        skill_score INTEGER NOT NULL,
        interview_score INTEGER NOT NULL,
        is_at_risk BOOLEAN DEFAULT 0,
        skills_json TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()
