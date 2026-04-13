// Simulates the FastAPI /triage backend logic in the browser for prototype

const RED_FLAG_PATTERNS = [
  { pattern: /chest pain.*(sweat|breath|arm)/i, label: 'Possible cardiac event detected' },
  { pattern: /(can'?t breathe|difficulty breathing|not breathing)/i, label: 'Severe breathing difficulty' },
  { pattern: /(seizure|convuls)/i, label: 'Seizure symptoms detected' },
  { pattern: /(unconscious|passed out|loss of consciousness)/i, label: 'Loss of consciousness' },
  { pattern: /(stroke|face drooping|arm weak|speech slur)/i, label: 'Stroke warning signs' },
  { pattern: /(anaphylax|throat clos|severe allerg)/i, label: 'Anaphylaxis risk' },
  { pattern: /(suicid|kill myself|end my life)/i, label: 'Mental health crisis' },
  { pattern: /(severe bleed|bleeding heavily|won'?t stop bleeding)/i, label: 'Severe bleeding' },
  { pattern: /(overdose|took too many pills)/i, label: 'Possible overdose' },
]

const KEYWORD_SCORES = [
  { pattern: /high fever|fever above|temperature of 10[3-9]|104|105/i, points: 12 },
  { pattern: /blood in (urine|stool|vomit)/i, points: 14 },
  { pattern: /severe headache|worst headache/i, points: 8 },
  { pattern: /vomit|nausea/i, points: 6 },
  { pattern: /dizz|vertigo/i, points: 6 },
  { pattern: /fast heartbeat|palpitation|heart racing/i, points: 7 },
  { pattern: /rash|hives/i, points: 4 },
]

const DURATION_SCORES = {
  'minutes': 3,
  'few_hours': 5,
  '6_24_hours': 8,
  '1_2_days': 6,
  '3_7_days': 10,
  'over_week': 14,
}

const CONDITION_SCORES = {
  heart_disease: 18,
  diabetes: 10,
  asthma: 10,
  hypertension: 8,
  pregnancy: 8,
}

function getCategory(score) {
  if (score >= 60) return 'EMERGENCY'
  if (score >= 40) return 'URGENT'
  if (score >= 20) return 'MONITOR'
  return 'LOW_RISK'
}

function generateGuidance(category, symptoms) {
  const guides = {
    EMERGENCY: {
      explanation: 'Your symptoms suggest a potentially serious medical condition that requires immediate attention. The combination of factors you described indicates this cannot wait. Please call emergency services or have someone drive you to the nearest emergency room right now.',
      first_aid_steps: [
        'Call 112 or 911 immediately — do not delay',
        'Stay as still and calm as possible; sit or lie down safely',
        'Do not eat or drink anything until evaluated by a doctor',
        'Inform someone nearby about your condition',
      ],
      doctor_questions: [
        '→ What is the most likely cause of my symptoms?',
        '→ Do I need any emergency tests or imaging right now?',
        '→ Should I be admitted to the hospital?',
        '→ Are my current medications safe to continue?',
        '→ What warning signs should bring me back to the ER?',
      ],
    },
    URGENT: {
      explanation: 'Your symptoms indicate a condition that needs medical attention within the next few hours. While this may not be an emergency, delaying care could allow the situation to worsen. Please contact your doctor or visit an urgent care clinic today.',
      first_aid_steps: [
        'Rest and avoid physical exertion until you see a doctor',
        'Stay hydrated — drink water or clear fluids if tolerated',
        'Monitor your symptoms and note any changes in severity',
        'Gather a list of your medications before visiting the clinic',
      ],
      doctor_questions: [
        '→ What is causing my symptoms and how serious is it?',
        '→ What tests do you recommend I have done?',
        '→ Should I come back if symptoms worsen in the next 12 hours?',
        '→ Is there anything I should avoid doing until I recover?',
        '→ Are there any over-the-counter options safe to take for now?',
      ],
    },
    MONITOR: {
      explanation: 'Your symptoms suggest a moderate condition that warrants medical attention within the next 24–48 hours. There is no immediate danger, but you should schedule a doctor\'s appointment soon and keep a close watch on how you feel.',
      first_aid_steps: [
        'Get adequate rest and avoid strenuous activities',
        'Stay well hydrated throughout the day',
        'Track your symptoms — write down any changes in timing or severity',
        'Schedule a doctor\'s appointment within 24–48 hours',
      ],
      doctor_questions: [
        '→ What is the likely diagnosis based on my symptoms?',
        '→ Are there lifestyle adjustments I should make?',
        '→ Do I need any blood work or diagnostics done?',
        '→ At what point should I seek urgent care instead?',
        '→ Is this something that may be related to my existing conditions?',
      ],
    },
    LOW_RISK: {
      explanation: 'Based on the information you\'ve shared, your symptoms appear to be mild and manageable at home for now. That said, you know your body best — if anything changes or worsens, do not hesitate to seek medical advice.',
      first_aid_steps: [
        'Rest comfortably and give your body time to recover',
        'Keep hydrated and maintain light, easily digestible meals',
        'Avoid self-medicating without reading labels carefully',
        'Revisit this assessment if symptoms persist beyond 3 days',
      ],
      doctor_questions: [
        '→ Are my symptoms consistent with a common, self-limiting illness?',
        '→ What home remedies or OTC options are safe for me?',
        '→ Are there any symptoms that would mean I should come in urgently?',
        '→ Is there anything in my history that makes this more concerning?',
        '→ How long should I expect these symptoms to last?',
      ],
    },
  }
  return guides[category]
}

export function runTriage(data) {
  const { symptoms, severity, duration, age, conditions } = data

  // Step 2: Red flag check
  const redFlags = RED_FLAG_PATTERNS
    .filter(rf => rf.pattern.test(symptoms))
    .map(rf => rf.label)

  if (redFlags.length > 0) {
    const guidance = generateGuidance('EMERGENCY', symptoms)
    return {
      category: 'EMERGENCY',
      redFlags,
      score: 100,
      scoreBreakdown: [{ label: 'Red flag detected', points: 100 }],
      ...guidance,
    }
  }

  // Step 3: Risk scoring
  const breakdown = []

  const severityPoints = Math.round((severity - 1) * 4.5)
  breakdown.push({ label: `Severity (${severity}/10)`, points: severityPoints })

  const durationPoints = DURATION_SCORES[duration] || 5
  breakdown.push({ label: 'Duration', points: durationPoints })

  let agePoints = 0
  const ageNum = parseInt(age)
  if (ageNum < 2 || ageNum > 75) agePoints = 15
  else if (ageNum < 12 || ageNum > 60) agePoints = 8
  if (agePoints > 0) breakdown.push({ label: 'Age risk factor', points: agePoints })

  let conditionPoints = 0
  ;(conditions || []).forEach(c => {
    if (CONDITION_SCORES[c]) conditionPoints += CONDITION_SCORES[c]
  })
  if (conditionPoints > 0) breakdown.push({ label: 'Pre-existing conditions', points: conditionPoints })

  let keywordPoints = 0
  KEYWORD_SCORES.forEach(kw => {
    if (kw.pattern.test(symptoms)) keywordPoints += kw.points
  })
  if (keywordPoints > 0) breakdown.push({ label: 'Symptom keywords', points: keywordPoints })

  const totalScore = severityPoints + durationPoints + agePoints + conditionPoints + keywordPoints
  const category = getCategory(totalScore)
  const guidance = generateGuidance(category, symptoms)

  return {
    category,
    redFlags: [],
    score: Math.min(totalScore, 100),
    scoreBreakdown: breakdown,
    ...guidance,
  }
}

export const MOCK_SESSIONS = [
  { id: 1, date: '2025-12-10', symptomSummary: 'Headache and mild fever for two days...', category: 'MONITOR', score: 28 },
  { id: 2, date: '2025-12-18', symptomSummary: 'Sore throat, runny nose and fatigue...', category: 'LOW_RISK', score: 14 },
  { id: 3, date: '2026-01-05', symptomSummary: 'Chest tightness and shortness of breath...', category: 'URGENT', score: 48 },
  { id: 4, date: '2026-01-22', symptomSummary: 'Mild stomach cramps and nausea since morning...', category: 'LOW_RISK', score: 18 },
  { id: 5, date: '2026-02-14', symptomSummary: 'High fever 103°F with body aches and chills...', category: 'URGENT', score: 44 },
  { id: 6, date: '2026-03-08', symptomSummary: 'Rash on arms and itching for three days...', category: 'MONITOR', score: 22 },
]
