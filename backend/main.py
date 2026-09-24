"""
UNZA Compass backend — FastAPI application entrypoint.

Student-facing endpoints:
    GET  /health
    POST /api/chat
    POST /api/feedback

Admin endpoints are mounted from admin.py under /api/admin/*.
"""
import json
import time

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models  # noqa: F401  (ensures models are registered on Base before create_all)
from admin import router as admin_router
from ai import generate_answer
from config import settings
from database import Base, engine, get_db
from models import QuestionLog, Feedback
from retrieval import retrieve
from schemas import ChatRequest, ChatResponse, SourceOut, FeedbackRequest

# Create tables if they don't exist yet (safe no-op if they already do)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="UNZA Compass API",
    description="Independent student-built AI prototype — not an official UNZA service.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "UNZA Compass API"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    question_text = payload.message.strip()
    if not question_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    start = time.perf_counter()

    context_items = retrieve(question_text, db, top_k=3)
    answer_text, mode = generate_answer(question_text, context_items)

    elapsed_ms = (time.perf_counter() - start) * 1000

    sources = [SourceOut(title=item.title, source=item.source or "General/example information")
               for item in context_items]

    log = QuestionLog(
        question=question_text,
        answer=answer_text,
        sources=json.dumps([s.model_dump() for s in sources]),
        mode=mode,
        response_time_ms=round(elapsed_ms, 1),
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return ChatResponse(
        question_id=log.id,
        answer=answer_text,
        sources=sources,
        mode=mode,
    )


@app.post("/api/feedback", status_code=201)
def submit_feedback(payload: FeedbackRequest, db: Session = Depends(get_db)):
    question = db.query(QuestionLog).filter(QuestionLog.id == payload.question_id).first()
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    existing = db.query(Feedback).filter(Feedback.question_id == payload.question_id).first()
    if existing:
        existing.helpful = payload.helpful
    else:
        db.add(Feedback(question_id=payload.question_id, helpful=payload.helpful))

    db.commit()
    return {"message": "Feedback recorded"}
