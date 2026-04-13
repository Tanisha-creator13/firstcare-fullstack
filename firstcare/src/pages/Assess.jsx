import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Edit2, Send, User, Activity, CheckSquare } from 'lucide-react'
import { useTriage } from '../context/TriageContext'
import { useAuth } from '../context/AuthContext'
import { apiTriage } from '../api/client'
import { runTriage } from '../data/triageEngine'

const CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hypertension', label: 'Hypertension' },
  { id: 'asthma', label: 'Asthma / COPD' },
  { id: 'heart_disease', label: 'Heart Disease' },
  { id: 'pregnancy', label: 'Pregnancy' },
  { id: 'none', label: 'None' },
]

const DURATIONS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'few_hours', label: 'A few hours' },
  { value: '6_24_hours', label: '6–24 hours' },
  { value: '1_2_days', label: '1–2 days' },
  { value: '3_7_days', label: '3–7 days' },
  { value: 'over_week', label: 'Over a week' },
]

const LOADING_MESSAGES = [
  'Running emergency checks…',
  'Calculating risk score…',
  'Generating guidance…',
  'Almost ready…',
]

export default function Assess() {
  const navigate = useNavigate()
  const { setResult } = useTriage()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState(0)

  const [form, setForm] = useState({
    age: '',
    gender: '',
    conditions: [],
    symptoms: '',
    duration: '',
    severity: 5,
  })

  const toggleCondition = (id) => {
    if (id === 'none') {
      setForm({ ...form, conditions: ['none'] })
      return
    }
    const filtered = form.conditions.filter(c => c !== 'none')
    if (filtered.includes(id)) {
      setForm({ ...form, conditions: filtered.filter(c => c !== id) })
    } else {
      setForm({ ...form, conditions: [...filtered, id] })
    }
  }

  const canNext1 = form.age && form.gender
  const canNext2 = form.symptoms.trim().length > 10 && form.duration

  const { user } = useAuth()

  const submit = async () => {
    setLoading(true)
    for (let i = 0; i < LOADING_MESSAGES.length; i++) {
      setLoadMsg(i)
      await new Promise(r => setTimeout(r, 700))
    }
    try {
      // Try real backend if user is logged in and API URL is configured
      let result
      if (user && import.meta.env.VITE_API_URL) {
        const data = await apiTriage(form)
        result = {
          category: data.category,
          score: data.risk_score,
          redFlags: data.red_flags,
          explanation: data.explanation,
          first_aid_steps: data.first_aid_steps,
          doctor_questions: data.doctor_questions,
          scoreBreakdown: data.score_breakdown,
        }
      } else {
        result = runTriage(form)
      }
      setResult(result)
      navigate('/results')
    } catch (err) {
      // Fall back to local engine on error
      const result = runTriage(form)
      setResult(result)
      navigate('/results')
    }
  }

  const SEVERITY_LABELS = ['', 'Very mild', 'Very mild', 'Mild', 'Mild', 'Moderate',
    'Moderate', 'Significant', 'Significant', 'Severe', 'Very severe']

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-navy-900/10 border-t-navy-900 animate-spin mx-auto mb-6" />
          <p className="font-body text-navy-800 font-medium text-lg">{LOADING_MESSAGES[loadMsg]}</p>
          <p className="text-navy-600/40 font-body text-sm mt-1">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-navy-900 mb-1">Symptom Assessment</h1>
          <p className="text-navy-600/50 font-body text-sm">Answer honestly for the most accurate guidance</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-medium transition-all
                ${step === n ? 'bg-navy-900 text-cream scale-110' : step > n ? 'bg-sage-400 text-navy-900' : 'bg-parchment border border-navy-900/20 text-navy-600/40'}`}>
                {step > n ? '✓' : n}
              </div>
              {n < 3 && <div className={`w-12 h-px ${step > n ? 'bg-sage-400' : 'bg-navy-900/15'} transition-colors`} />}
            </div>
          ))}
        </div>

        <div className="card p-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-sage-400" />
                <h2 className="font-display text-xl text-navy-900">About You</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Age</label>
                  <input
                    type="number"
                    min="1" max="120"
                    value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })}
                    placeholder="e.g. 32"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Known medical conditions</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {CONDITIONS.map(c => (
                    <label key={c.id}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer border transition-all text-sm font-body
                        ${form.conditions.includes(c.id)
                          ? 'bg-navy-900 text-cream border-navy-900'
                          : 'bg-parchment border-parchment hover:border-navy-900/30 text-navy-700'}`}>
                      <input
                        type="checkbox"
                        checked={form.conditions.includes(c.id)}
                        onChange={() => toggleCondition(c.id)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-xs border
                        ${form.conditions.includes(c.id) ? 'bg-sage-400 border-sage-400 text-navy-900' : 'border-navy-900/20'}`}>
                        {form.conditions.includes(c.id) && '✓'}
                      </div>
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={18} className="text-sage-400" />
                <h2 className="font-display text-xl text-navy-900">Your Symptoms</h2>
              </div>

              <div>
                <label className="label">Describe your symptoms <span className="text-ember-500">*</span></label>
                <textarea
                  rows={4}
                  value={form.symptoms}
                  onChange={e => setForm({ ...form, symptoms: e.target.value })}
                  placeholder="Be as specific as possible — e.g. 'I have a severe headache on the right side of my head, accompanied by nausea and sensitivity to light, started 3 hours ago…'"
                  className="input-field resize-none"
                />
                <p className="text-right text-xs text-navy-600/30 mt-1 font-body">{form.symptoms.length} chars</p>
              </div>

              <div>
                <label className="label">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map(d => (
                    <button key={d.value}
                      onClick={() => setForm({ ...form, duration: d.value })}
                      className={`px-3 py-2 rounded-xl text-xs font-body font-medium border transition-all
                        ${form.duration === d.value
                          ? 'bg-navy-900 text-cream border-navy-900'
                          : 'bg-parchment border-parchment hover:border-navy-900/30 text-navy-700'}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  Severity — {form.severity}/10
                  <span className="normal-case font-normal text-navy-600/50 ml-2">({SEVERITY_LABELS[form.severity]})</span>
                </label>
                <input
                  type="range" min="1" max="10" step="1"
                  value={form.severity}
                  onChange={e => setForm({ ...form, severity: parseInt(e.target.value) })}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-navy-600/30 font-body mt-1">
                  <span>1 · Barely noticeable</span>
                  <span>10 · Unbearable</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare size={18} className="text-sage-400" />
                <h2 className="font-display text-xl text-navy-900">Review & Submit</h2>
              </div>

              {[
                {
                  title: 'About You',
                  step: 1,
                  items: [
                    `Age: ${form.age}`,
                    `Gender: ${form.gender}`,
                    `Conditions: ${form.conditions.length ? form.conditions.join(', ') : 'None selected'}`,
                  ]
                },
                {
                  title: 'Symptoms',
                  step: 2,
                  items: [
                    `Symptoms: ${form.symptoms.substring(0, 80)}${form.symptoms.length > 80 ? '…' : ''}`,
                    `Duration: ${DURATIONS.find(d => d.value === form.duration)?.label || '—'}`,
                    `Severity: ${form.severity}/10`,
                  ]
                }
              ].map(section => (
                <div key={section.title} className="bg-parchment rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-body font-semibold text-navy-900 text-sm">{section.title}</h3>
                    <button onClick={() => setStep(section.step)}
                      className="text-xs text-navy-600/50 hover:text-navy-900 flex items-center gap-1 transition-colors">
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {section.items.map(item => (
                      <li key={item} className="text-xs text-navy-700/70 font-body">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs font-body">
                ⚠️ By submitting, you acknowledge that this tool does not replace professional medical advice.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-parchment">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="btn-outline text-sm py-2 px-4">
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canNext1 : !canNext2}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-sm py-2 px-5"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={submit} className="btn-primary bg-sage-400 text-navy-900 hover:bg-sage-500 text-sm py-2 px-5">
                <Send size={15} /> Submit Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
