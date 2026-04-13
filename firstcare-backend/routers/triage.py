from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from database import get_db
from triage_engine import run_triage

router = APIRouter(tags=["triage"])


@router.post("/triage", response_model=schemas.TriageResponse)
def triage(
    body: schemas.TriageRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = run_triage(body)

    # Persist session
    session = models.SymptomSession(
        user_id=current_user.id,
        symptoms=None if current_user.anonymous_mode else body.symptoms,
        severity=body.severity,
        duration=body.duration,
        age=body.age,
        gender=body.gender,
        conditions=body.conditions,
        category=result["category"],
        risk_score=result["risk_score"],
        red_flags=result["red_flags"],
        explanation=result["explanation"],
        first_aid_steps=result["first_aid_steps"],
        doctor_questions=result["doctor_questions"],
        score_breakdown=[s.model_dump() for s in result["score_breakdown"]],
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return schemas.TriageResponse(
        session_id=session.id,
        category=result["category"],
        risk_score=result["risk_score"],
        red_flags=result["red_flags"],
        explanation=result["explanation"],
        first_aid_steps=result["first_aid_steps"],
        doctor_questions=result["doctor_questions"],
        score_breakdown=result["score_breakdown"],
    )
