from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[schemas.SessionSummary])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sessions = (
        db.query(models.SymptomSession)
        .filter(models.SymptomSession.user_id == current_user.id)
        .order_by(models.SymptomSession.timestamp.desc())
        .all()
    )
    return [
        schemas.SessionSummary(
            id=s.id,
            category=s.category,
            risk_score=s.risk_score,
            severity=s.severity,
            duration=s.duration,
            symptom_summary=s.symptoms[:60] if s.symptoms else None,
            timestamp=s.timestamp,
        )
        for s in sessions
    ]


@router.get("/{session_id}", response_model=schemas.SessionDetail)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    s = (
        db.query(models.SymptomSession)
        .filter(
            models.SymptomSession.id == session_id,
            models.SymptomSession.user_id == current_user.id,
        )
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return schemas.SessionDetail(
        id=s.id,
        category=s.category,
        risk_score=s.risk_score,
        severity=s.severity,
        duration=s.duration,
        symptom_summary=s.symptoms[:60] if s.symptoms else None,
        timestamp=s.timestamp,
        red_flags=s.red_flags or [],
        explanation=s.explanation,
        first_aid_steps=s.first_aid_steps or [],
        doctor_questions=s.doctor_questions or [],
        score_breakdown=s.score_breakdown or [],
        age=s.age,
        gender=s.gender,
        conditions=s.conditions or [],
    )


@router.delete("", status_code=204)
def delete_all_sessions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.SymptomSession).filter(
        models.SymptomSession.user_id == current_user.id
    ).delete()
    db.commit()
