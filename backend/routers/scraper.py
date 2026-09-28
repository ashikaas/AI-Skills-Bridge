from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.job_scraper import job_scraper

router = APIRouter(prefix="/api/scraper", tags=["scraper"])

class ScrapeUrlRequest(BaseModel):
    url: str
    user_id: Optional[str] = "usr_student_1"

@router.post("/trigger")
def trigger_scraping_batch(limit: int = 6):
    """
    Triggers live market web scraping across tech feeds, parses NLP skill entities,
    and indexes newly discovered jobs into the database.
    """
    try:
        result = job_scraper.scrape_public_job_feeds(limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraper error: {str(e)}")

@router.post("/url")
def scrape_and_match_url(payload: ScrapeUrlRequest):
    """
    Scrapes an arbitrary job posting URL, extracts required technologies,
    and returns a 4-vector fit analysis against the student's profile.
    """
    if not payload.url or not payload.url.strip():
        raise HTTPException(status_code=400, detail="Job URL must be provided")

    result = job_scraper.scrape_and_analyze_url(payload.url, payload.user_id)
    return result

@router.get("/stats")
def get_scraper_statistics():
    """
    Returns live indexing metrics, last sync timestamp, and active feeds.
    """
    return job_scraper.get_stats()
