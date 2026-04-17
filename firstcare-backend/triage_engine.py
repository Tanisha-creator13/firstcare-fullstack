"""
Triage Engine — Ethical AI Edition
Integrated with Clinical Reasoning (D3) and Safety Interceptors (D5).
"""

import re
import json
import logging
from typing import Optional

import google.generativeai as genai

from config import settings
from schemas import TriageRequest, ScoreBreakdownItem

logger = logging.getLogger(__name__)

# ── Configure Gemini ──────────────────────────────────────────────────────────
genai.configure(api_key=settings.gemini_api_key)
_model = genai.GenerativeModel("gemini-1.5-flash")


# ── Red flag patterns (Safety Interceptor D5) ─────────────────────────────────
RED_FLAG_PATTERNS = [
    (r"chest\s*pain.{0,40}(sweat|breath|arm|jaw)", "Possible cardiac event"),
    (r"(can'?t breathe|difficulty breathing|struggling to breathe|not breathing)", "Severe breathing difficulty"),
    (r"(seizure|convuls)", "Seizure symptoms"),
    (r"(unconscious|passed out|loss of consciousness|unresponsive)", "Loss of consciousness"),
    (r"(stroke|face\s*droop|arm\s*weak|speech\s*slur|sudden\s*numbness)", "Stroke warning signs"),
    (r"(anaphylax|throat\s*clos|tongue\s*swell)", "Anaphylaxis risk"),
    (r"(suicid|kill\s*myself|end\s*my\s*life|want\s*to\s*die)", "Mental health crisis"),
    (r"(severe\s*bleed|bleeding\s*heavily|won'?t\s*stop\s*bleed)", "Severe uncontrolled bleeding"),
    (r"(overdose|took\s*too\s*many\s*(pills|tablets|medication))", "Possible overdose"),
    (r"(head\s*injur|hit\s*(my\s*)?head).{0,40}(confus|dizz|vomit|pass)", "Head injury with neurological signs"),
    (r"(sudden\s*vision\s*loss|can'?t\s*see)", "Sudden vision loss"),
    (r"infant.{0,30}(fever|temperature)", "Infant with fever"),
]

COMPILED_RED_FLAGS = [(re.compile(p, re.I), label) for p, label in RED_FLAG_PATTERNS]


# ── Scoring constants ─────────────────────────────────────────────────────────
DURATION_SCORES = {
    "minutes": 3,
    "few_hours": 5,
    "6_24_hours": 8,
    "1_2_days": 6,
    "3_7_days": 10,
    "over_week": 14,
}

CONDITION_SCORES = {
    "heart_disease": 18,
    "diabetes": 10,
    "asthma": 10,
    "hypertension": 8,
    "pregnancy": 8,
}

KEYWORD_SCORES = [
    (re.compile(r"high\s*fever|fever\s*above|temperature\s*of\s*10[3-9]|1[01][0-9]\s*f", re.I), 12),
    (re.compile(r"blood\s*in\s*(urine|stool|vomit|pee|feces)", re.I), 14),
    (re.compile(r"severe\s*headache|worst\s*headache|thunder(clap)?\s*headache", re.I), 8),
    (re.compile(r"vomit|nausea", re.I), 6),
    (re.compile(r"dizz(y|iness)|vertigo", re.I), 6),
    (re.compile(r"fast\s*heartbeat|palpitation|heart\s*racing|tachycardia", re.I), 7),
    (re.compile(r"\brash\b|hives|urticaria", re.I), 4),
]

# Regex to strip diagnostic language (Safety Layer)
DIAGNOSIS_PHRASES = re.compile(
    r"\b(you\s*(have|are\s*diagnosed\s*with)|diagnosis\s*(is|of)|this\s*is\s*(definitely|certainly|likely)\s*(a|an)?|"
    r"prescri(be|ption)|take\s+(mg|milligram|tablet|pill)|dosage|medication\s+of)\b",
    re.I,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _detect_red_flags(symptoms: str) -> list[str]:
    return [label for pattern, label in COMPILED_RED_FLAGS if pattern.search(symptoms)]


def _calculate_score(req: TriageRequest) -> tuple[int, list[ScoreBreakdownItem]]:
    breakdown: list[ScoreBreakdownItem] = []

    # Severity (1–10) → 0–40.5 pts
    severity_pts = round((req.severity - 1) * 4.5)
    breakdown.append(ScoreBreakdownItem(label=f"Severity ({req.severity}/10)", points=severity_pts))

    # Duration
    dur_pts = DURATION_SCORES.get(req.duration, 5)
    breakdown.append(ScoreBreakdownItem(label="Duration", points=dur_pts))

    # Age
    age_pts = 0
    if req.age < 2 or req.age > 75:
        age_pts = 15
    elif req.age < 12 or req.age > 60:
        age_pts = 8
    if age_pts:
        breakdown.append(ScoreBreakdownItem(label="Age risk factor", points=age_pts))

    # Pre-existing conditions
    condition_pts = sum(CONDITION_SCORES.get(c, 0) for c in req.conditions)
    if condition_pts:
        breakdown.append(ScoreBreakdownItem(label="Pre-existing conditions", points=condition_pts))

    # Symptom keywords
    keyword_pts = sum(pts for pat, pts in KEYWORD_SCORES if pat.search(req.symptoms))
    if keyword_pts:
        breakdown.append(ScoreBreakdownItem(label="Symptom keywords", points=keyword_pts))

    total = min(severity_pts + dur_pts + age_pts + condition_pts + keyword_pts, 100)
    return total, breakdown


def _score_to_category(score: int) -> str:
    if score >= 60: return "EMERGENCY"
    if score >= 40: return "URGENT"
    if score >= 20: return "MONITOR"
    return "LOW_RISK"


def _build_gemini_prompt(req: TriageRequest, category: str, score: int) -> str:
    conditions_str = ", ".join(req.conditions) if req.conditions and "none" not in req.conditions else "None"
    return f"""You are a medical triage assistant. Analyze the patient data and provide guidance.
    
Patient: Age {req.age}, Gender {req.gender}, History: {conditions_str}.
Symptoms: "{req.symptoms}" (Severity {req.severity}/10, Duration: {req.duration.replace("_", " ")})
Triage Result: {category} ({score}/100)

Your Task:
1. Provide a supportive explanation ending in "Please see a doctor."
2. Provide a 'clinical_logic' field: explain clearly WHY this risk level was chosen (e.g. "Respiratory symptoms are higher risk given your history of asthma").
3. DO NOT diagnose or prescribe. DO NOT use medication names.

Return ONLY JSON:
{{
  "explanation": "Plain English summary...",
  "clinical_logic": "One sentence reasoning for the risk score...",
  "first_aid_steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "doctor_questions": ["Q1", "Q2", "Q3", "Q4", "Q5"]
}}"""


def _fallback_guidance(category: str) -> dict:
    """Fallback if Gemini fails or for immediate Red Flag triggers."""
    fallbacks = {
        "EMERGENCY": {
            "explanation": "Your symptoms suggest a potentially serious condition. Call emergency services immediately. Please see a doctor.",
            "clinical_logic": "Risk level set to maximum due to critical red flag detection.",
            "first_aid_steps": ["Call 911/112 immediately.", "Do not exert yourself.", "Unlock your door for paramedics.", "Alert someone nearby."],
            "doctor_questions": ["What caused this sudden onset?", "What emergency tests are needed?", "Is my condition stable?"],
        },
        "URGENT": {
            "explanation": "Your symptoms need attention within a few hours. Please see a doctor.",
            "clinical_logic": "Risk score reflects high severity and acute symptoms.",
            "first_aid_steps": ["Rest immediately.", "Monitor temperature.", "Gather current medications.", "Avoid solid foods if nauseous."],
            "doctor_questions": ["Is this related to my history?", "What are the warning signs for the ER?", "When should I follow up?"],
        },
        "MONITOR": {
            "explanation": "Monitor symptoms closely over the next 24 hours. Please see a doctor.",
            "clinical_logic": "Symptoms are moderate but stable. Score based on severity and duration.",
            "first_aid_steps": ["Hydrate with clear fluids.", "Log symptom changes.", "Rest in a cool room."],
            "doctor_questions": ["What lifestyle changes help?", "Is this a self-limiting illness?", "What diagnostic tests are next?"],
        },
        "LOW_RISK": {
            "explanation": "Symptoms appear mild. Monitor at home. Please see a doctor.",
            "clinical_logic": "Symptom severity and duration are within low-risk parameters.",
            "first_aid_steps": ["Rest and recover.", "Stay hydrated.", "Re-evaluate if symptoms persist."],
            "doctor_questions": ["What OTC options are safe?", "How long should this last?", "Are there specific triggers to avoid?"],
        },
    }
    return fallbacks.get(category, fallbacks["LOW_RISK"])


def _call_gemini(prompt: str, category: str) -> dict:
    try:
        response = _model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=800,
            ),
        )
        raw = response.text.strip()
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)

        # Validate structure (Transparency D3 requirement)
        assert "explanation" in data
        assert "clinical_logic" in data
        return data
    except Exception as exc:
        logger.warning("Gemini failed (%s). Falling back.", exc)
        return _fallback_guidance(category)


def _apply_safety_layer(guidance: dict, category: str) -> dict:
    """Safety Interceptor: Strip diagnoses and handle emergency overrides."""
    explanation = DIAGNOSIS_PHRASES.sub("", guidance["explanation"])
    if category == "EMERGENCY":
        explanation = "🚨 CALL 911 OR 112 IMMEDIATELY. " + explanation
    guidance["explanation"] = explanation.strip()
    return guidance


# ── Public API ────────────────────────────────────────────────────────────────

def run_triage(req: TriageRequest) -> dict:
    # 1. Red Flags (Safety Interceptor D5)
    red_flags = _detect_red_flags(req.symptoms)
    if red_flags:
        guidance = _fallback_guidance("EMERGENCY")
        guidance = _apply_safety_layer(guidance, "EMERGENCY")
        return {
            "category": "EMERGENCY",
            "risk_score": 100,
            "red_flags": red_flags,
            "score_breakdown": [ScoreBreakdownItem(label="Manual Safety Override: Red Flag Detected", points=100)],
            **guidance,
        }

    # 2. Heuristic Scoring
    total_score, breakdown = _calculate_score(req)
    category = _score_to_category(total_score)

    # 3. LLM Reasoning (Transparency D3)
    prompt = _build_gemini_prompt(req, category, total_score)
    guidance = _call_gemini(prompt, category)

    # 4. Final Safety Pass
    guidance = _apply_safety_layer(guidance, category)

    return {
        "category": category,
        "risk_score": total_score,
        "red_flags": [],
        "score_breakdown": breakdown,
        **guidance,
    }