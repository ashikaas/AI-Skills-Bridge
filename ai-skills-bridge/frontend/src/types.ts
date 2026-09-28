export type UserRole = "student" | "tpo";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string;
}

export interface StudentProfile {
  user_id: string;
  name: string;
  email: string;
  avatar_url: string;
  university: string;
  degree: string;
  branch: string;
  year: number;
  cgpa: number;
  target_role: string;
  preferred_industries: string[];
  streak_days: number;
  xp_points: number;
  level: number;
  placement_readiness: number;
  market_alignment: number;
  skill_mastery: number;
  project_readiness: number;
  interview_readiness: number;
  projects?: StudentProject[];
  badges?: Badge[];
}

export interface StudentProject {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_demo_url?: string;
  highlights: string[];
}

export interface Badge {
  id: number;
  badge_name: string;
  badge_title: string;
  description: string;
  icon: string;
  unlocked_at?: string;
}

export interface StudentSkill {
  id: number;
  skill_name: string;
  normalized_skill: string;
  proficiency_level: string;
  score: number;
  learn_score: number;
  practice_score: number;
  do_score: number;
  interview_score: number;
  mastery_percentage: number;
  evidence_summary: string;
  status: "Mastered" | "Developing" | "Critical Gap";
  evidence_breakdown?: {
    learn: { completed: boolean; score: number };
    practice: { completed: boolean; score: number };
    project: { completed: boolean; score: number };
    interview: { completed: boolean; score: number };
  };
}

export interface SkillGapItem {
  skill: string;
  student_score: number;
  market_demand: number;
  raw_gap: number;
  priority_score: number;
  category: "Critical Gap" | "High Gap" | "Developing" | "Strong";
  explanation: string;
}

export interface TrackModule {
  id: string;
  track_id: string;
  week_number: number;
  theme: string;
  type: "LEARN" | "PRACTICE" | "DO";
  title: string;
  description: string;
  associated_skill: string;
  estimated_minutes: number;
  is_completed: boolean;
  completed_at?: string;
  content: {
    key_points?: string[];
    code_snippet?: string;
    resources?: Array<{ title: string; url: string }>;
    total_questions?: number;
    challenges_count?: number;
    dataset?: string;
    status?: string;
  };
}

export interface TrackWeek {
  week: number;
  theme: string;
  modules: TrackModule[];
}

export interface ExtraTrack {
  id: string;
  user_id: string;
  target_role: string;
  title: string;
  duration_weeks: number;
  total_modules: number;
  completed_modules: number;
  overall_progress: number;
  is_active: boolean;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  skill: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "SQL" | "Python" | "MCQ" | "Scenario";
  prompt: string;
  starter_code: string;
  sample_data: any;
  expected_concept: string;
  hints: string[];
}

export interface PracticeEvaluation {
  score: number;
  correctness_score: number;
  concept_score: number;
  efficiency_score: number;
  feedback: string;
  explanation: string;
}

export interface IndustryChallenge {
  id: string;
  title: string;
  domain: string;
  target_role: string;
  overview: string;
  tasks: string[];
  dataset_description: string;
  dataset_sample: any[];
  rubric: Record<string, { weight: number; desc: string }>;
}

export interface ProjectEvaluation {
  overall_score: number;
  technical_score: number;
  analysis_score: number;
  business_score: number;
  problem_solving_score: number;
  communication_score: number;
  visualization_score: number;
  feedback: string;
  strengths: string[];
  recommendations: string[];
}

export interface MockInterviewState {
  interview_id: string;
  interview_type: string;
  target_role: string;
  current_turn: number;
  total_turns: number;
  question: string;
  expected_skill: string;
  hint: string;
  is_completed?: boolean;
  turn_evaluation?: {
    score: number;
    accuracy_score: number;
    relevance_score: number;
    communication_score: number;
    feedback: string;
    follow_up_hint: string;
  };
  report?: InterviewReport;
}

export interface InterviewReport {
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  project_knowledge_score: number;
  confidence_score: number;
  hr_readiness_score: number;
  radar_data: Array<{ dimension: string; score: number; benchmark: number }>;
  strengths: string[];
  weaknesses: string[];
  practice_recommendations: string[];
}

export interface JobMatch {
  id: string;
  company: string;
  role: string;
  location: string;
  industry: string;
  experience_level: string;
  salary_range: string;
  description: string;
  skills_required: string[];
  overall_match: number;
  skill_match: number;
  experience_match: number;
  project_match: number;
  missing_skills: string[];
}

export interface TpoDashboardData {
  total_students: number;
  placement_ready_pct: number;
  market_aligned_pct: number;
  average_skill_score: number;
  average_interview_score: number;
  students_at_risk: number;
  department_breakdown: Array<{
    department: string;
    total_students: number;
    ready_percentage: number;
    average_readiness: number;
  }>;
  readiness_distribution: Array<{ range: string; count: number }>;
  active_interventions: Array<{
    id: string;
    title: string;
    target_department: string;
    target_skill: string;
    affected_students_count: number;
    market_demand_pct: number;
    curriculum_weeks: number;
    status: string;
    expected_readiness_boost: number;
  }>;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "market" | "track" | "interview" | "badge" | "practice";
  is_read: boolean;
  created_at: string;
}
