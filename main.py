"""
AI-Powered Higher Education Discovery Platform
Python FastAPI ML Microservice
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import numpy as np
import logging
import os
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="EduDiscover ML API",
    description="AI-powered college recommendation and analysis microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class StudentProfile(BaseModel):
    percentage12th: float = 70.0
    preferredCourses: List[str] = []
    budgetMax: float = 1000000
    preferredStates: List[str] = []
    preferredCollegeType: str = "Any"
    jeeRank: Optional[int] = None

class CollegeData(BaseModel):
    _id: Any
    name: str
    type: str
    tier: Optional[str] = "Tier 2"
    location: Optional[Dict] = {}
    averageFees: Optional[float] = 0
    entranceExams: Optional[List[str]] = []
    rankings: Optional[Dict] = {}
    placementData: Optional[List[Dict]] = []
    courses: Optional[List[Dict]] = []
    accreditation: Optional[str] = None

class RecommendRequest(BaseModel):
    student_profile: StudentProfile
    colleges: List[Dict]

class SentimentRequest(BaseModel):
    text: str
    review_id: Optional[str] = None

class ChatRequest(BaseModel):
    query: str
    context: Optional[str] = None

# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"service": "EduDiscover ML API", "status": "running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# ─── Recommendation Engine ────────────────────────────────────────────────────

def compute_match_score(profile: StudentProfile, college: dict) -> tuple[float, list[str]]:
    """
    Content-based filtering: computes a weighted match score (0-100)
    between a student profile and a college.
    """
    score = 0.0
    reasons = []

    # --- 1. Budget match (weight: 30) ---
    avg_fees = college.get("averageFees", 0) or 0
    budget = profile.budgetMax or 1000000
    if avg_fees <= budget:
        budget_score = max(0, 1 - (avg_fees / budget)) * 30
        score += budget_score
        if avg_fees <= budget * 0.5:
            reasons.append("Well within your budget")
        else:
            reasons.append("Fits your budget")

    # --- 2. Location match (weight: 20) ---
    college_state = (college.get("location") or {}).get("state", "")
    if profile.preferredStates:
        if college_state in profile.preferredStates:
            score += 20
            reasons.append(f"Located in preferred state ({college_state})")
        else:
            score += 5  # partial credit
    else:
        score += 15  # no preference = neutral

    # --- 3. College type match (weight: 15) ---
    if profile.preferredCollegeType == "Any":
        score += 15
    elif profile.preferredCollegeType in college.get("type", ""):
        score += 15
        reasons.append(f"Matches preferred type ({college.get('type')})")
    else:
        score += 5

    # --- 4. Academic suitability (weight: 20) ---
    tier = college.get("tier", "Tier 3")
    pct = profile.percentage12th
    tier_thresholds = {"Tier 1": 85, "Tier 2": 70, "Tier 3": 50}
    threshold = tier_thresholds.get(tier, 50)
    if pct >= threshold:
        academic_score = min(20, 20 * (pct - threshold + 10) / 30)
        score += academic_score
        reasons.append("Matches your academic profile")
    elif pct >= threshold - 10:
        score += 8
        reasons.append("Slightly below typical cutoff—consider applying")

    # --- 5. Course availability (weight: 10) ---
    college_courses = [c.get("name", "").lower() for c in (college.get("courses") or [])]
    preferred = [c.lower() for c in profile.preferredCourses]
    if preferred:
        matched_courses = [c for c in preferred if any(p in c or c in p for p in college_courses)]
        if matched_courses:
            score += 10
            reasons.append(f"Offers preferred courses: {', '.join(matched_courses[:2])}")
    else:
        score += 7

    # --- 6. JEE rank / entrance exam match (weight: 5) ---
    exams = college.get("entranceExams", []) or []
    if profile.jeeRank and "JEE" in exams:
        nirf = (college.get("rankings") or {}).get("nirf") or 999
        expected_rank = max(100, nirf * 500)
        if profile.jeeRank <= expected_rank:
            score += 5
            reasons.append("JEE rank eligible for admission")

    # Cap at 100
    final_score = round(min(100, max(30, score)), 1)
    return final_score, reasons[:3]  # Top 3 reasons


@app.post("/recommend")
async def recommend_colleges(req: RecommendRequest):
    try:
        profile = req.student_profile
        colleges = req.colleges
        
        scored = []
        for college in colleges:
            match_pct, reasons = compute_match_score(profile, college)
            scored.append({
                "college_id": str(college.get("_id", "")),
                "match_percentage": match_pct,
                "match_reasons": reasons,
            })

        # Sort descending by match percentage
        scored.sort(key=lambda x: x["match_percentage"], reverse=True)
        
        logger.info(f"Generated recommendations for profile: {profile.percentage12th}%, budget: {profile.budgetMax}")
        return {
            "success": True,
            "recommendations": scored[:15],  # Top 15
            "algorithm": "content-based-filtering-v1",
        }
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Sentiment Analysis ───────────────────────────────────────────────────────

def analyze_text_sentiment(text: str) -> dict:
    """
    Rule-based sentiment analysis (production: replace with HuggingFace model).
    Returns label, score (-1 to 1), and confidence.
    """
    text_lower = text.lower()
    
    promo_phrases = [
        "best college", "number one", "world class", "most amazing",
        "perfect institute", "no complaints", "100% placement", "guaranteed"
    ]
    negative_phrases = [
        "worst", "terrible", "scam", "fraud", "money waste",
        "avoid", "never join", "horrible", "pathetic"
    ]
    positive_phrases = [
        "good", "great", "excellent", "helpful", "learned", "improved",
        "nice faculty", "good placement", "recommend", "satisfied"
    ]

    promo_count = sum(1 for p in promo_phrases if p in text_lower)
    neg_count = sum(1 for p in negative_phrases if p in text_lower)
    pos_count = sum(1 for p in positive_phrases if p in text_lower)

    word_count = len(text.split())
    
    if promo_count >= 3 or (promo_count >= 2 and word_count < 50):
        return {"label": "promotional", "score": 0.8, "confidence": 0.75}
    elif neg_count >= 2:
        return {"label": "negative", "score": -0.7, "confidence": 0.80}
    elif pos_count > neg_count:
        score = min(0.9, 0.4 + pos_count * 0.1)
        return {"label": "genuine", "score": score, "confidence": 0.70}
    elif neg_count > 0:
        score = max(-0.5, -0.2 - neg_count * 0.1)
        return {"label": "mixed", "score": score, "confidence": 0.65}
    else:
        return {"label": "genuine", "score": 0.3, "confidence": 0.60}


@app.post("/sentiment")
async def sentiment_analysis(req: SentimentRequest):
    try:
        result = analyze_text_sentiment(req.text)
        logger.info(f"Sentiment for review {req.review_id}: {result['label']} ({result['score']:.2f})")
        return {"success": True, **result}
    except Exception as e:
        logger.error(f"Sentiment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Chatbot / NLP ────────────────────────────────────────────────────────────

COLLEGE_FAQ = {
    "placement": "Based on our data, top placements are offered by IITs, NITs, and premier private institutes. Average packages range from 6-12 LPA for engineering colleges.",
    "fees": "Government colleges (IITs/NITs) charge ₹1–2 lakh/year. Private colleges range from ₹2–15 lakh/year depending on accreditation.",
    "computer science": "Top CS colleges: IIT Bombay, IIT Delhi, BITS Pilani, NIT Trichy, VIT Vellore. Focus on NIRF rankings and placement records.",
    "jee": "For JEE Advanced rank under 1000: IIT Bombay/Delhi CS. Under 5000: Other IIT branches. Under 15000: Top NITs. Use our recommendation engine for personalized guidance.",
    "default": "I can help you with college recommendations, fees, placement records, and entrance exam guidance. Please ask a specific question about colleges!",
}

@app.post("/chat")
async def chatbot(req: ChatRequest):
    try:
        query_lower = req.query.lower()
        
        answer = None
        for keyword, response in COLLEGE_FAQ.items():
            if keyword in query_lower:
                answer = response
                break
        
        if not answer:
            answer = COLLEGE_FAQ["default"]

        return {
            "success": True,
            "answer": answer,
            "sources": ["EduDiscover Database"],
            "disclaimer": "AI-generated response. Verify with official college websites.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
