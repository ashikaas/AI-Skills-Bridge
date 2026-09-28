from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth, student, resume, market, skills, tracks, practice, projects, interview, jobs, tpo, copilot, scraper

app = FastAPI(
    title="AI Skills-Bridge API",
    description="Backend API for Smart India Hackathon ED083 - AI Skills-Bridge",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth.router)
app.include_router(student.router)
app.include_router(resume.router)
app.include_router(market.router)
app.include_router(skills.router)
app.include_router(tracks.router)
app.include_router(practice.router)
app.include_router(projects.router)
app.include_router(interview.router)
app.include_router(jobs.router)
app.include_router(tpo.router)
app.include_router(copilot.router)
app.include_router(scraper.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "AI Skills-Bridge",
        "version": "1.0.0",
        "tagline": "Learn. Practice. Do. Get Hired.",
        "sih_problem": "ED083"
    }
