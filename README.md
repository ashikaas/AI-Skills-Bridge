# AI SKILLS-BRIDGE
### *Learn. Practice. Do. Get Hired.*

> **AI-Powered Placement & Talent Readiness Platform**  
> **Problem Statement (EdTech / HRTech):**  
> *Real-time Market-Sync job scraping (LinkedIn & Internshala), resume ATS gap diagnostics, curated course recommendations (NPTEL & Coursera), and a 3-step mastery loop (Learn, Practice, Do) backed by Google Gemini AI to supercharge graduate placement rates.*

---

## 1. Executive Summary & Problem Context

In the modern tech hiring landscape, over **80% of university engineering graduates face difficulty passing initial technical screening rounds** for high-growth roles (Data Analytics, AI/ML, Cloud Engineering, Software Engineering) because academic curricula lag industry hiring requirements by 2 to 4 years.

### The Breakdown:
1. **Curriculum Disconnect:** Curricula teach theoretical foundations but miss modern tools (e.g. teaching basic SQL syntax while 92% of market listings require Window Functions, CTEs, and Star Schema data modeling).
2. **Superficial Certifications:** Students complete video courses without practical code validation.
3. **The Interview Defense Gap:** Candidates fail technical and project defense rounds because they cannot defend architectural choices.
4. **Placement Cell Blindness:** Training & Placement Officers (TPOs) lack real-time cohort visibility into branch skill deficits until campus hiring drives begin.

**AI Skills-Bridge** establishes an end-to-end closed-feedback loop connecting live market demand, student gap diagnostics, curated course recommendations, multi-dimension grading rubrics, and adaptive AI mock interviews.

---

## 2. Core Architecture & System Flow

```
                               ┌────────────────────────┐
                               │ Live Job Scraper       │
                               │ LinkedIn & Internshala │
                               └───────────┬────────────┘
                                           │
                                           ▼
┌────────────────────────┐     ┌────────────────────────┐
│ Candidate Profile &    │     │ Market-Sync Scanner    │
│ Resume ATS Scan        │     │ Tech Stack Frequency   │
└───────────┬────────────┘     └───────────┬────────────┘
            │                              │
            └──────────────┬───────────────┘
                           ▼
               ┌────────────────────────┐
               │  Missing Skill Gaps    │
               │  Role-Aware Analysis   │
               └───────────┬────────────┘
                           ▼
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│ Recommended Courses   │         │ Learn → Practice → Do │
│ (NPTEL, Coursera, edX)│         │ 3-Step Mastery Loop   │
└───────────┬───────────┘         └───────────┬───────────┘
            │                                 │
            └─────────────────┬───────────────┘
                              ▼
                  ┌────────────────────────┐
                  │ AI Mock Interview &    │
                  │ Google Gemini Copilot  │
                  └───────────┬────────────┘
                              ▼
                  ┌────────────────────────┐
                  │ TPO Cohort Analytics & │
                  │ Intervention Engine    │
                  └────────────────────────┘
```

---

## 3. Key Features & Innovations

### A. Live Market-Sync Scraper (LinkedIn & Internshala)
- **Live Web Indexing:** Scrapes active hiring postings directly from **LinkedIn Jobs India** and **Internshala**.
- **Tech Stack Frequency Analysis:** Computes demand percentages in real time (SQL 98%, Python 86%, Cloud 45%, GenAI +43%).
- **Emerging Skill Velocity Tracker:** Tracks fast-growing skill requirements across top Indian tech employers (Razorpay, Swiggy, Google India, CRED, Meesho, PhonePe, Zepto, Dunzo).

### B. Resume ATS Scanner & Gap Diagnostics
- Parses uploaded resumes and extracts concrete, quoted technical evidence.
- Calculates ATS Compatibility Score (e.g. 84/100) and pinpoints missing keywords for 10 target tech roles.

### C. Recommended Courses (NPTEL & Coursera)
- **Multi-Platform Recommendations:** Curated course recommendations from **NPTEL (IITs / Govt Certified)**, **Coursera**, **Udemy**, **edX**, and **YouTube (FreeCodeCamp)**.
- **Role Gap Alignment:** Automatically tags missing candidate skills with a `⚠ Missing Gap Skill` priority badge.
- **Direct Course Enrolment & Bookmarking:** Save courses to personal study plans and access official course links in one click.

### D. The 3-Step Mastery Loop: Learn → Practice → Do
- **Step 1: Learn:** Interactive micro-lessons paired with an on-demand **AI Concept Tutor**.
- **Step 2: Practice:** Hands-on SQL and Python coding drills evaluated by an automated AI Grader.
- **Step 3: Do (Industry Project):** Real-world capstone projects with 6-dimension evaluation rubrics (*Technical, Analysis, Business, Problem Solving, Communication, Visualization*).

### E. AI Mock Interview & Gemini Copilot
- **Google Gemini Integration:** Uses `google-genai` (`gemini-2.5-flash`) for multi-turn technical mock interviews, resume project defense, and live career advice.
- **Adaptive Difficulty & Voice Input:** Adjusts question complexity based on candidate responses; supports speech-to-text voice answers.
- **Competency Radar Report:** 6-axis skill breakdown with actionable improvement plans.

### F. TPO Executive Dashboard & Cohort Analytics
- **Cohort Heatmap:** Matrix of university departments (CSE, AIML, IT, ECE) vs. skills, highlighting systemic branch gaps.
- **1-Click Interventions:** Deploys batch upskilling tracks with simulated readiness uplift metrics.

---

## 4. Tech Stack Overview

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Fast UI rendering, type safety, HMR |
| **Styling** | Tailwind CSS v3, Glassmorphic Design | Modern dark-mode UI system (`#0B0F19`) |
| **Icons & Effects**| Lucide React, Canvas Confetti | Modern UI icons & celebratory confetti animations |
| **Backend** | Python 3.12, FastAPI, Uvicorn | Asynchronous RESTful API backend |
| **Database** | SQLite3 (`skillsbridge.db`) | Relational data persistence |
| **AI / LLM** | Google Gemini API (`google-genai` v2.23.0) | Powers AI Copilot, Mock Interviews, & ATS diagnostics |
| **Web Scraper** | BeautifulSoup4 + urllib / re | Scrapes live job postings from LinkedIn & Internshala |

---

## 5. Demo Credentials

One-click access credentials:

| Role | Email | Password | Persona Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@skillsbridge.demo` | `student123` | **Ashwin Kumar** (3rd Year B.Tech AIML, Target: Data Analyst, 78% Readiness) |
| **TPO** | `tpo@skillsbridge.demo` | `tpo123` | **Dr. Ramesh Sharma** (Director of Placements, 55 Cohort Candidates) |

---

## 6. How to Run Locally

### Prerequisites
- Node.js LTS (v20+ or v24+)
- Python 3.12+

### Quick Start Commands

1. **Start Backend Server:**
   ```bash
   cd backend
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Backend runs at: `http://127.0.0.1:8000` (Swagger docs at `/docs`)*

2. **Start Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   *Frontend UI runs at: `http://localhost:5173`*

3. **(Optional) Enable Live Gemini API:**
   ```bash
   set GEMINI_API_KEY="your_google_gemini_api_key_here"
   ```

---

*AI Skills-Bridge — Learn. Practice. Do. Get Hired.*
