"""
SQLAlchemy ORM models for UNZA Compass.

Tables:
- AdminUser: the single administrator account
- KnowledgeItem: knowledge-base entries (CRUD from the admin dashboard)
- QuestionLog: every student question + the answer given + metadata
- Feedback: helpful / not helpful feedback tied to a QuestionLog entry
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    keywords = Column(Text, nullable=False, default="")  # comma-separated
    source = Column(String, nullable=False, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def keyword_list(self):
        return [k.strip() for k in self.keywords.split(",") if k.strip()]


class QuestionLog(Base):
    __tablename__ = "question_logs"

    id = Column(String, primary_key=True, default=gen_uuid)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources = Column(Text, nullable=False, default="")  # JSON string of source list
    mode = Column(String, nullable=False, default="FALLBACK")  # "AI" or "FALLBACK"
    response_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    feedback = relationship("Feedback", back_populates="question", uselist=False)


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True, default=gen_uuid)
    question_id = Column(String, ForeignKey("question_logs.id"), nullable=False, unique=True)
    helpful = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("QuestionLog", back_populates="feedback")
