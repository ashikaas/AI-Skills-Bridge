const API_BASE = "http://127.0.0.1:8000/api";

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API fetch error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getProfile: (userId = "usr_student_1") =>
    apiFetch<any>(`/student/profile?user_id=${userId}`),

  updateTargetRole: (target_role: string, userId = "usr_student_1") =>
    apiFetch<any>(`/student/target-role?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify({ target_role }),
    }),

  getDashboard: (userId = "usr_student_1") =>
    apiFetch<any>(`/student/dashboard?user_id=${userId}`),

  analyzeResume: async (file: File | null, useDemo = true, targetRole = "Data Analyst") => {
    const formData = new FormData();
    formData.append("use_demo", String(useDemo));
    formData.append("target_role", targetRole);
    if (file) {
      formData.append("file", file);
    }
    const res = await fetch(`${API_BASE}/resume/analyze`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Resume analysis failed");
    return res.json();
  },

  getMarketSkills: (role = "Data Analyst", days = 90) =>
    apiFetch<any>(`/market/skills?role=${encodeURIComponent(role)}&days=${days}`),

  getMarketTrends: (role = "Data Analyst") =>
    apiFetch<any>(`/market/trends?role=${encodeURIComponent(role)}`),

  getMarketJobs: (role = "Data Analyst", limit = 15) =>
    apiFetch<any[]>(`/market/jobs?role=${encodeURIComponent(role)}&limit=${limit}`),

  getSkillGaps: (userId = "usr_student_1") =>
    apiFetch<any>(`/skills/gaps?user_id=${userId}`),

  getSkillPassport: (userId = "usr_student_1") =>
    apiFetch<any>(`/skills/passport?user_id=${userId}`),

  getCurrentTrack: (userId = "usr_student_1") =>
    apiFetch<any>(`/tracks/current?user_id=${userId}`),

  completeModule: (moduleId: string, userId = "usr_student_1") =>
    apiFetch<any>(`/tracks/complete-module?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify({ module_id: moduleId }),
    }),

  getPracticeChallenges: () =>
    apiFetch<any[]>("/practice/challenges"),

  submitPracticeAnswer: (challengeId: string, answer: string, userId = "usr_student_1") =>
    apiFetch<any>(`/practice/submit?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify({ challenge_id: challengeId, submitted_answer: answer }),
    }),

  getIndustryChallenges: () =>
    apiFetch<any[]>("/projects/challenges"),

  submitIndustryProject: (data: { challenge_id: string; submission_text: string; code_solution: string; repo_link: string }, userId = "usr_student_1") =>
    apiFetch<any>(`/projects/submit?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  startInterview: (data: { interview_type: string; difficulty: string; target_role: string }, userId = "usr_student_1") =>
    apiFetch<any>(`/interview/start?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  answerInterviewTurn: (interviewId: string, answer: string, userId = "usr_student_1") =>
    apiFetch<any>(`/interview/answer?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify({ interview_id: interviewId, student_answer: answer }),
    }),

  getInterviewReport: (interviewId: string) =>
    apiFetch<any>(`/interview/report/${interviewId}`),

  getRecommendedJobs: (userId = "usr_student_1") =>
    apiFetch<any[]>(`/jobs/recommended?user_id=${userId}`),

  getTpoDashboard: () =>
    apiFetch<any>("/tpo/dashboard"),

  getTpoHeatmap: () =>
    apiFetch<any>("/tpo/heatmap"),

  createIntervention: (data: any) =>
    apiFetch<any>("/tpo/intervention", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCohortStudents: (department = "All", atRisk = false) =>
    apiFetch<any[]>(`/tpo/students?department=${department}&at_risk=${atRisk}`),

  copilotChat: (message: string, userId = "usr_student_1") =>
    apiFetch<any>(`/copilot/chat?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  triggerScraper: (limit = 6) =>
    apiFetch<any>(`/scraper/trigger?limit=${limit}`, {
      method: "POST",
    }),

  scrapeJobUrl: (url: string, userId = "usr_student_1") =>
    apiFetch<any>("/scraper/url", {
      method: "POST",
      body: JSON.stringify({ url, user_id: userId }),
    }),

  getScraperStats: () =>
    apiFetch<any>("/scraper/stats"),
};
