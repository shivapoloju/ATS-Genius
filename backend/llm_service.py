"""
LLM-powered resume analysis.

Generates:
- ATS score
- Skill-gap analysis
- Interview questions
- Career recommendations

using prompt-engineered workflows on top of the Gemini LLM.
"""

import json
import logging
import os
import re
import uuid
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv

try:
    from geminiintegrations.llm.chat import (
        LlmChat,
        UserMessage,
    )
except Exception:
    # Development fallback when Gemini SDK
    # is unavailable. Use standard google-generativeai package if available.
    try:
        import google.generativeai as genai
    except ImportError:
        genai = None

    class UserMessage:
        def __init__(self, text: str):
            self.text = text

    class LlmChat:
        def __init__(
            self,
            api_key: str = None,
            session_id: str = None,
            system_message: str = None,
        ):
            self.api_key = api_key
            self.session_id = session_id
            self.system_message = system_message

        def with_model(
            self,
            provider: str,
            model_name: str,
        ):
            return self

        async def send_message(
            self,
            message: UserMessage,
        ) -> str:
            if genai and self.api_key:
                try:
                    genai.configure(api_key=self.api_key)
                    model = genai.GenerativeModel(
                        model_name="models/gemini-2.5-flash",
                        system_instruction=self.system_message
                    )
                    # Force response to be JSON format
                    response = model.generate_content(
                        message.text,
                        generation_config={"response_mime_type": "application/json"}
                    )
                    if response and response.text:
                        return response.text
                except Exception as api_error:
                    logger.error(f"Gemini API execution failed: {api_error}")

            return """
{
  "inferred_job_title":"Unknown",
  "ats_score":50,
  "score_breakdown":{
      "skills_match":50,
      "experience_match":50,
      "education_match":50,
      "keyword_match":50
  },
  "matched_skills":[],
  "missing_skills":[],
  "skill_gap_analysis":"No deep analysis available in development mode.",
  "interview_questions":[],
  "career_recommendations":[],
  "summary":"Development mode summary."
}
"""

# --------------------------------------------------
# Configuration
# --------------------------------------------------

ROOT_DIR = Path(__file__).parent

load_dotenv(ROOT_DIR / ".env")

logger = logging.getLogger(__name__)

GEMINI_LLM_KEY = os.environ.get("GEMINI_LLM_KEY")

SYSTEM_MESSAGE = (
    "You are an expert ATS (Applicant Tracking System) analyst "
    "and senior technical recruiter with 15+ years of experience "
    "in resume screening and candidate evaluation across "
    "enterprise hiring pipelines. You analyze resumes against "
    "job descriptions with precision, objectivity and honest "
    "actionable feedback. You always respond with a single valid "
    "JSON object only. Never return markdown, code fences or "
    "additional commentary."
)
def build_analysis_prompt(
    resume_text: str,
    job_description: str,
    relevant_chunks: List[str],
    job_title: Optional[str],
    keyword_match_score: int,
) -> str:
    relevant_chunks_text = (
        "\n---\n".join(relevant_chunks)
        if relevant_chunks
        else "N/A"
    )

    return f"""
Analyze this resume against the job description and return a JSON object with the exact structure specified below.

JOB TITLE (if provided):
{job_title or "Not specified - infer from the job description"}

JOB DESCRIPTION:
{job_description}

FULL RESUME TEXT:
{resume_text[:8000]}

MOST RELEVANT RESUME SECTIONS
(retrieved via TF-IDF semantic similarity search against the job description):

{relevant_chunks_text}

A programmatic keyword / semantic similarity score between the full resume
and the job description was computed as:

{keyword_match_score}/100

Use exactly this value for "keyword_match" in the breakdown below.
Use it only as one input signal for your reasoning on the remaining scores.

Return ONLY a valid JSON object (no markdown, no code fences) with EXACTLY
this structure:

{{
  "inferred_job_title": "the job title, inferred from the job description if not explicitly given",

  "ats_score": <integer 0-100, overall holistic match score>,

  "score_breakdown": {{
    "skills_match": <integer 0-100>,
    "experience_match": <integer 0-100>,
    "education_match": <integer 0-100>,
    "keyword_match": {keyword_match_score}
  }},

  "matched_skills": [
    "up to 15 relevant skills/keywords present in both resume and job description"
  ],

  "missing_skills": [
    "up to 10 important skills/keywords required by the job description but missing or weak in the resume"
  ],

  "skill_gap_analysis":
    "2-4 sentence honest analysis of the candidate's skill gaps relative to this specific role",

  "interview_questions": [
    {{
      "question": "tailored interview question text",
      "category": "Technical"
    }}

    ... exactly 6 tailored interview questions total, mixing categories from:

    Technical
    Behavioral
    Situational
    Experience
  ],

  "career_recommendations": [
    "3-5 specific, actionable recommendations to improve this candidate's fit for this or similar roles"
  ],

  "summary":
    "2-3 sentence overall summary of the candidate's fit for this role"
}}
"""
def extract_json_response(response_text: str) -> dict:
    """
    Extract a valid JSON object from the LLM response.
    """

    cleaned_response = response_text.strip()

    cleaned_response = re.sub(
        r"^```(json)?",
        "",
        cleaned_response,
        flags=re.IGNORECASE,
    ).strip()

    cleaned_response = re.sub(
        r"```$",
        "",
        cleaned_response,
    ).strip()

    try:
        return json.loads(cleaned_response)

    except json.JSONDecodeError:
        json_match = re.search(
            r"\{.*\}",
            cleaned_response,
            re.DOTALL,
        )

        if json_match:
            return json.loads(json_match.group(0))

        raise


async def analyze_resume_against_job(
    resume_text: str,
    job_description: str,
    relevant_chunks: List[str],
    job_title: Optional[str],
    keyword_match_score: int,
) -> dict:
    """
    Analyze a resume against a job description using Gemini.
    """

    llm_chat = (
        LlmChat(
            api_key=GEMINI_LLM_KEY,
            session_id=f"resume-analysis-{uuid.uuid4()}",
            system_message=SYSTEM_MESSAGE,
        )
        .with_model(
            "openai",
            "gpt-5.4",
        )
    )

    analysis_prompt = build_analysis_prompt(
        resume_text=resume_text,
        job_description=job_description,
        relevant_chunks=relevant_chunks,
        job_title=job_title,
        keyword_match_score=keyword_match_score,
    )

    logger.info("Sending resume analysis request to LLM")

    response_text = await llm_chat.send_message(
        UserMessage(text=analysis_prompt)
    )

    analysis_result = extract_json_response(
        response_text
    )

    logger.info("Resume analysis completed successfully")

    return analysis_result