from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sessions = (
        db.query(models.SymptomSession)
        .filter(models.SymptomSession.user_id == current_user.id)
        .order_by(models.SymptomSession.timestamp.asc())
        .all()
    )

    total = len(sessions)
    latest_category = sessions[-1].category if sessions else None
    avg_severity = (sum(s.severity for s in sessions) / total) if total else 0.0
    high_priority = sum(1 for s in sessions if s.category in ("EMERGENCY", "URGENT"))

    # Urgency distribution
    dist: dict[str, int] = {}
    for s in sessions:
        dist[s.category] = dist.get(s.category, 0) + 1

    # Severity over time (use risk_score as proxy for chart)
    sot = [
        {"date": s.timestamp.strftime("%Y-%m-%d"), "score": s.risk_score}
        for s in sessions
    ]

    return schemas.DashboardStats(
        total_sessions=total,
        latest_category=latest_category,
        avg_severity=round(avg_severity, 1),
        high_priority_count=high_priority,
        urgency_distribution=dist,
        severity_over_time=sot,
    )
