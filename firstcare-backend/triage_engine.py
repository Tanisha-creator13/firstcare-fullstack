"""
Triage Engine — mirrors the spec exactly.

Step 1  Pydantic validation (done in router)
Step 2  Red flag regex detection → immediate EMERGENCY
Step 3  Risk scoring (severity / duration / age / conditions / keywords)
Step 4  Gemini API call for explanation + first_aid_steps + doctor_questions
Step 5  Safety layer (strip diagnoses, prepend 112 call if EMERGENCY)
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


# ── Red flag patterns ─────────────────────────────────────────────────────────
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
    if score >= 60:
        return "EMERGENCY"
    if score >= 40:
        return "URGENT"
    if score >= 20:
        return "MONITOR"
    return "LOW_RISK"


def _build_gemini_prompt(req: TriageRequest, category: str, score: int) -> str:
    conditions_str = ", ".join(req.conditions) if req.conditions and "none" not in req.conditions else "None"
    return f"""You are a medical triage assistant. A patient has submitted the following information.

Patient profile:
- Age: {req.age}, Gender: {req.gender}
- Known conditions: {conditions_str}
- Symptom description: "{req.symptoms}"
- Duration: {req.duration.replace("_", " ")}
- Severity: {req.severity}/10
- Triage category: {category} (risk score {score}/100)

Your task: Generate supportive, plain-English guidance. Follow these rules strictly:
1. Do NOT diagnose any specific disease or condition.
2. Do NOT mention any medication names or dosages.
3. Always end the explanation with "Please see a doctor."
4. Keep all language calm and reassuring, not alarming.
5. Return ONLY valid JSON — no markdown, no backticks, no preamble.

Return this exact JSON structure:
{{
  "explanation": "2-3 sentences in plain English describing what the symptoms may indicate (no diagnosis), ending with 'Please see a doctor.'",
  "first_aid_steps": ["step 1", "step 2", "step 3", "step 4"],
  "doctor_questions": ["question 1", "question 2", "question 3", "question 4", "question 5"]
}}"""


def _fallback_guidance(category: str) -> dict:
    """Used when Gemini call fails."""
    fallbacks = {
        "EMERGENCY": {
            "explanation": "Your symptoms suggest a potentially serious condition. Call emergency services immediately. Please see a doctor.",
            "first_aid_steps": [
                "Call 112 or 911 immediately.",
                "Stay still and calm — do not exert yourself.",
                "Do not eat or drink anything.",
                "Alert someone nearby about your condition.",
            ],
            "doctor_questions": [
                "What is the most likely cause of my symptoms?",
                "Do I need emergency tests or imaging?",
                "Should I be admitted to hospital?",
                "Are my current medications safe to continue?",
                "What warning signs should bring me back to the ER?",
            ],
        },
        "URGENT": {
            "explanation": "Your symptoms need medical attention within a few hours. Avoid strenuous activity and monitor closely. Please see a doctor.",
            "first_aid_steps": [
                "Rest and avoid physical exertion.",
                "Stay hydrated with water or clear fluids.",
                "Monitor symptoms and note any changes.",
                "Prepare a list of your current medications.",
            ],
            "doctor_questions": [
                "What is causing my symptoms and how serious is it?",
                "What tests do you recommend?",
                "Should I return if symptoms worsen in 12 hours?",
                "Is there anything I should avoid?",
                "Are there safe over-the-counter options in the meantime?",
            ],
        },
        "MONITOR": {
            "explanation": "Your symptoms suggest a moderate condition that warrants attention within 24–48 hours. There is no immediate danger. Please see a doctor.",
            "first_aid_steps": [
                "Rest and avoid strenuous activity.",
                "Stay well hydrated.",
                "Track changes in your symptoms.",
                "Schedule a doctor's appointment within 48 hours.",
            ],
            "doctor_questions": [
                "What is the likely cause of my symptoms?",
                "Are there lifestyle adjustments I should make?",
                "Do I need blood work or diagnostics?",
                "When should I seek urgent care instead?",
                "Could this be related to my existing conditions?",
            ],
        },
        "LOW_RISK": {
            "explanation": "Your symptoms appear mild and manageable at home for now. Monitor for any changes. Please see a doctor.",
            "first_aid_steps": [
                "Rest and allow your body to recover.",
                "Stay hydrated and eat light meals.",
                "Avoid self-medicating without reading labels.",
                "Reassess if symptoms persist beyond 3 days.",
            ],
            "doctor_questions": [
                "Are my symptoms consistent with a self-limiting illness?",
                "What home remedies or OTC options are safe for me?",
                "What symptoms would mean I should come in urgently?",
                "Is there anything in my history that makes this more concerning?",
                "How long should I expect these symptoms to last?",
            ],
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
        # Strip accidental markdown fences
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)

        # Validate structure
        assert "explanation" in data
        assert isinstance(data.get("first_aid_steps"), list) and len(data["first_aid_steps"]) >= 1
        assert isinstance(data.get("doctor_questions"), list) and len(data["doctor_questions"]) >= 1
        return data
    except Exception as exc:
        logger.warning("Gemini call failed (%s), using fallback guidance.", exc)
        return _fallback_guidance(category)


def _apply_safety_layer(guidance: dict, category: str) -> dict:
    """Remove diagnostic language; prepend 112 message for EMERGENCY."""
    explanation = DIAGNOSIS_PHRASES.sub("", guidance["explanation"])
    if category == "EMERGENCY":
        explanation = "🚨 Call 112 or 911 immediately. " + explanation
    guidance["explanation"] = explanation.strip()
    return guidance


# ── Public API ────────────────────────────────────────────────────────────────

def run_triage(req: TriageRequest) -> dict:
    """
    Returns a dict with keys:
        category, risk_score, red_flags, explanation,
        first_aid_steps, doctor_questions, score_breakdown
    """
    # Step 2: red flags
    red_flags = _detect_red_flags(req.symptoms)
    if red_flags:
        guidance = _fallback_guidance("EMERGENCY")
        guidance = _apply_safety_layer(guidance, "EMERGENCY")
        return {
            "category": "EMERGENCY",
            "risk_score": 100,
            "red_flags": red_flags,
            "score_breakdown": [ScoreBreakdownItem(label="Red flag detected", points=100)],
            **guidance,
        }

    # Step 3: scoring
    total_score, breakdown = _calculate_score(req)
    category = _score_to_category(total_score)

    # Step 4: Gemini
    prompt = _build_gemini_prompt(req, category, total_score)
    guidance = _call_gemini(prompt, category)

    # Step 5: safety
    guidance = _apply_safety_layer(guidance, category)

    return {
        "category": category,
        "risk_score": total_score,
        "red_flags": [],
        "score_breakdown": breakdown,
        **guidance,
    }
