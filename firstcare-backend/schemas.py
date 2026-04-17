from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str


# ── Triage ────────────────────────────────────────────────────────────────────

class TriageRequest(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., pattern="^(male|female|other|prefer_not)$")
    conditions: list[str] = Field(default_factory=list)
    symptoms: str = Field(..., min_length=10, max_length=2000)
    duration: str = Field(..., pattern="^(minutes|few_hours|6_24_hours|1_2_days|3_7_days|over_week)$")
    severity: int = Field(..., ge=1, le=10)

    @field_validator("conditions")
    @classmethod
    def validate_conditions(cls, v):
        allowed = {"diabetes", "hypertension", "asthma", "heart_disease", "pregnancy", "none"}
        for c in v:
            if c not in allowed:
                raise ValueError(f"Invalid condition: {c}")
        return v


class ScoreBreakdownItem(BaseModel):
    label: str
    points: int

class TriageResponse(BaseModel):
    session_id: int
    category: str
    risk_score: int
    red_flags: list[str]
    explanation: str
    clinical_logic: str
    first_aid_steps: list[str]
    doctor_questions: list[str]
    score_breakdown: list[ScoreBreakdownItem]


# ── Sessions ──────────────────────────────────────────────────────────────────

class SessionSummary(BaseModel):
    id: int
    category: str
    risk_score: int
    severity: int
    duration: str
    symptom_summary: Optional[str]   # None if anonymous
    timestamp: datetime

    class Config:
        from_attributes = True

class SessionDetail(SessionSummary):
    red_flags: list[str]
    explanation: Optional[str]
    clinical_logic: Optional[str]
    first_aid_steps: list[str]
    doctor_questions: list[str]
    score_breakdown: list[dict]
    age: Optional[int]
    gender: Optional[str]
    conditions: list[str]

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_sessions: int
    latest_category: Optional[str]
    avg_severity: float
    high_priority_count: int
    urgency_distribution: dict[str, int]
    severity_over_time: list[dict]   # [{date, score}]


# ── Library ───────────────────────────────────────────────────────────────────

class LibraryItem(BaseModel):
    id: int
    condition_name: str
    category: str
    icon: str
    description: str
    steps: list[str]

    class Config:
        from_attributes = True


# ── Profile ───────────────────────────────────────────────────────────────────

class ProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    anonymous_mode: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    email: Optional[EmailStr] = None
    anonymous_mode: Optional[bool] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=128)
