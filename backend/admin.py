"""
Admin API router. All routes except /api/admin/login are protected by
the get_current_admin dependency (JWT bearer token required).
"""
import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import verify_password, create_access_token, get_current_admin
from database import get_db
from models import AdminUser, KnowledgeItem, QuestionLog, Feedback
from schemas import (
    AdminLoginRequest,
    AdminLoginResponse,
    KnowledgeCreate,
    KnowledgeUpdate,
    KnowledgeOut,
    QuestionOut,
    SourceOut,
    FeedbackOut,
    StatsOut,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ---------- Auth ----------

@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == payload.email).first()
    if admin is None or not verify_password(payload.password, admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(subject=admin.email)
    return AdminLoginResponse(access_token=token, email=admin.email)


@router.post("/logout")
def admin_logout(current_admin: AdminUser = Depends(get_current_admin)):
    # Stateless JWT: logout is handled client-side by discarding the token.
    # This endpoint exists so the frontend has a clear, auditable logout call.
    return {"message": "Logged out successfully"}


# ---------- Stats ----------

@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    week_start = today_start - timedelta(days=7)

    total_questions = db.query(func.count(QuestionLog.id)).scalar() or 0
    questions_today = (
        db.query(func.count(QuestionLog.id)).filter(QuestionLog.created_at >= today_start).scalar() or 0
    )
    questions_this_week = (
        db.query(func.count(QuestionLog.id)).filter(QuestionLog.created_at >= week_start).scalar() or 0
    )
    knowledge_items = db.query(func.count(KnowledgeItem.id)).scalar() or 0
    ai_responses = db.query(func.count(QuestionLog.id)).filter(QuestionLog.mode == "AI").scalar() or 0
    fallback_responses = (
        db.query(func.count(QuestionLog.id)).filter(QuestionLog.mode == "FALLBACK").scalar() or 0
    )
    avg_response_time = db.query(func.avg(QuestionLog.response_time_ms)).scalar()

    return StatsOut(
        total_questions=total_questions,
        questions_today=questions_today,
        questions_this_week=questions_this_week,
        knowledge_items=knowledge_items,
        ai_responses=ai_responses,
        fallback_responses=fallback_responses,
        avg_response_time_ms=round(avg_response_time, 1) if avg_response_time else None,
    )


# ---------- Knowledge base CRUD ----------

def _to_knowledge_out(item: KnowledgeItem) -> KnowledgeOut:
    return KnowledgeOut(
        id=item.id,
        title=item.title,
        category=item.category,
        content=item.content,
        keywords=item.keyword_list(),
        source=item.source,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.get("/knowledge", response_model=list[KnowledgeOut])
def list_knowledge(
    search: str = Query(default=""),
    category: str = Query(default=""),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    q = db.query(KnowledgeItem)
    if category:
        q = q.filter(KnowledgeItem.category == category)
    if search:
        like = f"%{search.lower()}%"
        q = q.filter(
            func.lower(KnowledgeItem.title).like(like) | func.lower(KnowledgeItem.content).like(like)
        )
    items = q.order_by(KnowledgeItem.updated_at.desc()).all()
    return [_to_knowledge_out(i) for i in items]


@router.post("/knowledge", response_model=KnowledgeOut, status_code=status.HTTP_201_CREATED)
def create_knowledge(
    payload: KnowledgeCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = KnowledgeItem(
        title=payload.title,
        category=payload.category,
        content=payload.content,
        keywords=",".join(payload.keywords),
        source=payload.source,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _to_knowledge_out(item)


@router.get("/knowledge/{item_id}", response_model=KnowledgeOut)
def get_knowledge(
    item_id: str, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)
):
    item = db.query(KnowledgeItem).filter(KnowledgeItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    return _to_knowledge_out(item)


@router.put("/knowledge/{item_id}", response_model=KnowledgeOut)
def update_knowledge(
    item_id: str,
    payload: KnowledgeUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = db.query(KnowledgeItem).filter(KnowledgeItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Knowledge item not found")

    item.title = payload.title
    item.category = payload.category
    item.content = payload.content
    item.keywords = ",".join(payload.keywords)
    item.source = payload.source
    item.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(item)
    return _to_knowledge_out(item)


@router.delete("/knowledge/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge(
    item_id: str, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)
):
    item = db.query(KnowledgeItem).filter(KnowledgeItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    db.delete(item)
    db.commit()
    return None


# ---------- Questions monitoring ----------

def _to_question_out(q: QuestionLog) -> QuestionOut:
    try:
        sources = [SourceOut(**s) for s in json.loads(q.sources)] if q.sources else []
    except (json.JSONDecodeError, TypeError):
        sources = []

    feedback_value = None
    if q.feedback is not None:
        feedback_value = q.feedback.helpful

    return QuestionOut(
        id=q.id,
        question=q.question,
        answer=q.answer,
        sources=sources,
        mode=q.mode,
        response_time_ms=q.response_time_ms,
        created_at=q.created_at,
        feedback=feedback_value,
    )


@router.get("/questions", response_model=list[QuestionOut])
def list_questions(
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    questions = db.query(QuestionLog).order_by(QuestionLog.created_at.desc()).limit(limit).all()
    return [_to_question_out(q) for q in questions]


@router.get("/questions/{question_id}", response_model=QuestionOut)
def get_question(
    question_id: str, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)
):
    q = db.query(QuestionLog).filter(QuestionLog.id == question_id).first()
    if q is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return _to_question_out(q)


# ---------- Feedback ----------

@router.get("/feedback", response_model=list[FeedbackOut])
def list_feedback(db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    rows = (
        db.query(Feedback, QuestionLog)
        .join(QuestionLog, Feedback.question_id == QuestionLog.id)
        .order_by(Feedback.created_at.desc())
        .all()
    )
    return [
        FeedbackOut(
            id=fb.id,
            question_id=fb.question_id,
            question=ql.question,
            helpful=fb.helpful,
            created_at=fb.created_at,
        )
        for fb, ql in rows
    ]
