"""
MongoDB document models for the AI Resume Screening application.
"""

from datetime import datetime, timezone
from typing import Annotated, Any, List, Optional

from bson import ObjectId
from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
)


def validate_object_id(value: Any) -> str:
    """
    Validate MongoDB ObjectId.
    """

    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, str):
        return value

    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[
    str,
    BeforeValidator(validate_object_id),
]


class BaseDocument(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

    id: Optional[PyObjectId] = Field(
        default=None,
        alias="_id",
    )

    @classmethod
    def from_mongo(cls, document: dict):
        if document is None:
            return None

        mongo_document = dict(document)

        mongo_document["_id"] = str(
            mongo_document["_id"]
        )

        return cls(**mongo_document)

    def to_mongo(self) -> dict:
        mongo_document = self.model_dump(
            by_alias=True,
            exclude_none=True,
        )

        object_id = mongo_document.pop("_id", None)

        if (
            object_id is not None
            and ObjectId.is_valid(object_id)
        ):
            mongo_document["_id"] = ObjectId(
                object_id
            )

        return mongo_document


class ScoreBreakdown(BaseModel):
    skills_match: int
    experience_match: int
    education_match: int
    keyword_match: int


class InterviewQuestion(BaseModel):
    question: str
    category: str


class Analysis(BaseDocument):
    session_id: str

    resume_filename: str

    resume_text: str

    job_title: Optional[str] = None

    job_description: str

    ats_score: int

    score_breakdown: ScoreBreakdown

    matched_skills: List[str] = Field(
        default_factory=list
    )

    missing_skills: List[str] = Field(
        default_factory=list
    )

    skill_gap_analysis: str

    interview_questions: List[
        InterviewQuestion
    ] = Field(
        default_factory=list
    )

    career_recommendations: List[str] = Field(
        default_factory=list
    )

    summary: str

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )