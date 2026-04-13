from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, Float,
    DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    anonymous_mode = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sessions = relationship("SymptomSession", back_populates="user", cascade="all, delete-orphan")


class SymptomSession(Base):
    __tablename__ = "symptom_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Input (stored unless anonymous_mode)
    symptoms = Column(Text, nullable=True)
    severity = Column(Integer, nullable=False)
    duration = Column(String(50), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(30), nullable=True)
    conditions = Column(JSON, default=list)       # list of condition strings

    # Output
    category = Column(String(20), nullable=False)  # EMERGENCY | URGENT | MONITOR | LOW_RISK
    risk_score = Column(Integer, nullable=False)
    red_flags = Column(JSON, default=list)
    explanation = Column(Text, nullable=True)
    first_aid_steps = Column(JSON, default=list)
    doctor_questions = Column(JSON, default=list)
    score_breakdown = Column(JSON, default=list)

    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="sessions")


class FirstAidLibrary(Base):
    __tablename__ = "first_aid_library"

    id = Column(Integer, primary_key=True, index=True)
    condition_name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    icon = Column(String(10), nullable=False)
    description = Column(Text, nullable=False)
    steps = Column(JSON, nullable=False)          # list of strings


class RedFlagRule(Base):
    __tablename__ = "red_flag_rules"

    id = Column(Integer, primary_key=True, index=True)
    pattern = Column(String(300), nullable=False)
    label = Column(String(200), nullable=False)
    emergency_level = Column(String(20), default="EMERGENCY")
