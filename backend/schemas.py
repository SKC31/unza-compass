"""
Pydantic schemas for request validation and response serialization.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, EmailStr


# ---------- Chat ----------

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class SourceOut(BaseModel):
    title: str
    source: str


class ChatResponse(BaseModel):
    question_id: str
    answer: str
    sources: List[SourceOut]
    mode: str  # "AI" or "FALLBACK"


class FeedbackRequest(BaseModel):
    question_id: str
    helpful: bool


# ---------- Admin auth ----------

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


# ---------- Knowledge base ----------

class KnowledgeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    keywords: List[str] = Field(default_factory=list)
    source: str = Field(default="")


class KnowledgeCreate(KnowledgeBase):
    pass


class KnowledgeUpdate(KnowledgeBase):
    pass


class KnowledgeOut(BaseModel):
    id: str
    title: str
    category: str
    content: str
    keywords: List[str]
    source: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Questions (admin monitoring) ----------

class QuestionOut(BaseModel):
    id: str
    question: str
    answer: str
    sources: List[SourceOut]
    mode: str
    response_time_ms: Optional[float]
    created_at: datetime
    feedback: Optional[bool] = None  # None = no feedback given

    class Config:
        from_attributes = True


# ---------- Feedback (admin) ----------

class FeedbackOut(BaseModel):
    id: str
    question_id: str
    question: str
    helpful: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Stats ----------

class StatsOut(BaseModel):
    total_questions: int
    questions_today: int
    questions_this_week: int
    knowledge_items: int
    ai_responses: int
    fallback_responses: int
    avg_response_time_ms: Optional[float]
