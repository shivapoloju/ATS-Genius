import logging
import os
from pathlib import Path
from typing import List, Optional

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

from llm_service import analyze_resume_against_job
from models import Analysis
from pdf_utils import extract_text_from_pdf
from rag_utils import retrieve_relevant_chunks

# --------------------------------------------------
# Environment Configuration
# --------------------------------------------------

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

client = AsyncIOMotorClient(MONGO_URL)
database = client[DB_NAME]

# --------------------------------------------------
# FastAPI Configuration
# --------------------------------------------------

app = FastAPI()

api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


# --------------------------------------------------
# Helper Functions
# --------------------------------------------------

def validate_resume(resume: UploadFile):
    is_pdf = (
        resume.content_type == "application/pdf"
        or resume.filename.lower().endswith(".pdf")
    )

    if not is_pdf:
        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are supported.",
        )


def validate_job_description(job_description: str):
    if not job_description or len(job_description.strip()) < 30:
        raise HTTPException(
            status_code=400,
            detail=(
                "Please provide a more detailed job description "
                "(at least 30 characters)."
            ),
        )


def get_object_id(analysis_id: str):
    if not ObjectId.is_valid(analysis_id):
        raise HTTPException(
            status_code=404,
            detail="Analysis not found.",
        )

    return ObjectId(analysis_id)


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@api_router.get("/")
async def root():
    return {
        "message": "AI Resume Screening & Job Matching API",
    }
@api_router.post(
    "/analyze",
    response_model=Analysis,
    response_model_by_alias=False,
)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    session_id: str = Form(...),
    job_title: Optional[str] = Form(None),
):
    validate_resume(resume)
    validate_job_description(job_description)

    file_bytes = await resume.read()

    try:
        resume_text = extract_text_from_pdf(file_bytes)

    except Exception as error:
        logger.exception("PDF extraction failed")

        raise HTTPException(
            status_code=400,
            detail="Could not read this PDF file. Please try another file.",
        ) from error

    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not extract readable text from this PDF. "
                "Please upload a text-based (not scanned image) resume."
            ),
        )

    relevant_chunks, keyword_match_score = retrieve_relevant_chunks(
        resume_text,
        job_description,
    )

    try:
        analysis_result = await analyze_resume_against_job(
            resume_text=resume_text,
            job_description=job_description,
            relevant_chunks=relevant_chunks,
            job_title=job_title,
            keyword_match_score=keyword_match_score,
        )

    except Exception as error:
        logger.exception("LLM analysis failed")

        raise HTTPException(
            status_code=502,
            detail="AI analysis failed. Please try again in a moment.",
        ) from error

    analysis = Analysis(
        session_id=session_id,
        resume_filename=resume.filename,
        resume_text=resume_text,
        job_title=(
            job_title
            or analysis_result.get("inferred_job_title")
        ),
        job_description=job_description,
        ats_score=analysis_result.get("ats_score", 0),
        score_breakdown=analysis_result.get("score_breakdown", {}),
        matched_skills=analysis_result.get("matched_skills", []),
        missing_skills=analysis_result.get("missing_skills", []),
        skill_gap_analysis=analysis_result.get(
            "skill_gap_analysis",
            "",
        ),
        interview_questions=analysis_result.get(
            "interview_questions",
            [],
        ),
        career_recommendations=analysis_result.get(
            "career_recommendations",
            [],
        ),
        summary=analysis_result.get("summary", ""),
    )

    analysis_document = analysis.to_mongo()

    inserted_result = await database.analyses.insert_one(
        analysis_document
    )

    saved_analysis = await database.analyses.find_one(
        {
            "_id": inserted_result.inserted_id,
        }
    )

    return Analysis.from_mongo(saved_analysis)
# --------------------------------------------------
# Analysis Routes
# --------------------------------------------------

@api_router.get(
    "/analyses",
    response_model=List[Analysis],
    response_model_by_alias=False,
)
async def list_analyses(session_id: str):
    cursor = (
        database.analyses
        .find({"session_id": session_id})
        .sort("created_at", -1)
    )

    analysis_list = await cursor.to_list(length=500)

    return [
        Analysis.from_mongo(document)
        for document in analysis_list
    ]


@api_router.get(
    "/analyses/{analysis_id}",
    response_model=Analysis,
    response_model_by_alias=False,
)
async def get_analysis(analysis_id: str):
    object_id = get_object_id(analysis_id)

    analysis_document = await database.analyses.find_one(
        {
            "_id": object_id,
        }
    )

    if analysis_document is None:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found.",
        )

    return Analysis.from_mongo(analysis_document)


@api_router.delete("/analyses/{analysis_id}")
async def delete_analysis(analysis_id: str):
    object_id = get_object_id(analysis_id)

    delete_result = await database.analyses.delete_one(
        {
            "_id": object_id,
        }
    )

    if delete_result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found.",
        )

    return {
        "deleted": True,
    }


# --------------------------------------------------
# Register Router
# --------------------------------------------------

app.include_router(api_router)


# --------------------------------------------------
# Middleware
# --------------------------------------------------

raw_origins = os.environ.get("CORS_ORIGINS", "*").split(",")
cors_origins = [origin.strip().rstrip("/") for origin in raw_origins if origin.strip()]

if "*" in cors_origins:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials="*" not in cors_origins,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Shutdown Event
# --------------------------------------------------

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()