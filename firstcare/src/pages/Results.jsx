import { useNavigate, Link } from 'react-router-dom'
import { useTriage } from '../context/TriageContext'
import { MapPin, RefreshCw, AlertTriangle, CheckCircle2, Clipboard, ClipboardCheck } from 'lucide-react'
import { useState } from 'react'

const URGENCY_META = {
  EMERGENCY: {
    banner: 'bg-red-600 text-white',
    badge: 'bg-red-100 text-red-800 border-red-200',
    icon: '🚨',
    title: 'EMERGENCY',
    subtitle: 'Call 112 / 911 immediately',
    dot: 'bg-red-500',
  },
  URGENT: {
    banner: 'bg-orange-500 text-white',
    badge: 'bg-orange-50 text-orange-800 border-orange-200',
    icon: '⚡',
    title: 'URGENT',
    subtitle: 'See a doctor within hours',
    dot: 'bg-orange-500',
  },
  MONITOR: {
    banner: 'bg-yellow-500 text-navy-900',
    badge: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    icon: '👁️',
    title: 'MONITOR',
    subtitle: 'See a doctor within 24–48 hours',
    dot: 'bg-yellow-500',
  },
  LOW_RISK: {
    banner: 'bg-green-600 text-white',
    badge: 'bg-green-50 text-green-800 border-green-200',
    icon: '✅',
    title: 'LOW RISK',
    subtitle: 'Monitor at home',
    dot: 'bg-green-500',
  },
}

export default function Results() {
  const { result } = useTriage()
  const navigate = useNavigate()
  const [checked, setChecked] = useState({})

  if (!result) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center text-center px-4">
        <div>
          <p className="font-display text-2xl text-navy-900 mb-4">No assessment found</p>
          <Link to="/assess" className="btn-primary">Start Assessment</Link>
        </div>
      </div>
    )
  }

  const meta = URGENCY_META[result.category]
  const toggleCheck = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }))

  return (
    <div className="min-h-screen bg-parchment pb-16">
      {/* Urgency Banner */}
      <div className={`${meta.banner} py-5 px-4 text-center`}>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <div className="font-display text-2xl font-semibold tracking-wide">{meta.title}</div>
            <div className="font-body text-sm opacity-80 mt-0.5">{meta.subtitle}</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-5">
        {/* Risk score chip */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-body font-medium ${meta.badge}`}>
            <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
            Risk Score: {result.score}/100
          </div>
          <button
            onClick={() => navigate('/assess')}
            className="btn-outline text-sm py-2 px-4"
          >
            <RefreshCw size={14} /> New Assessment
          </button>
        </div>

        {/* Red Flags */}
        {result.redFlags && result.redFlags.length > 0 && (
          <div className="card p-5 border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-600" />
              <h2 className="font-display text-lg text-red-800">Red Flags Detected</h2>
            </div>
            <ul className="space-y-2">
              {result.redFlags.map((rf, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700 font-body">
                  <span className="text-red-500 mt-0.5">•</span> {rf}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanation */}
        <div className="card p-5">
          <h2 className="font-display text-lg text-navy-900 mb-3">What This May Mean</h2>
          <p className="font-body text-sm text-navy-700 leading-relaxed">{result.explanation}</p>
        </div>

        {/* First Aid */}
        <div className="card p-5">
          <h2 className="font-display text-lg text-navy-900 mb-4">Immediate First Aid Steps</h2>
          <ol className="space-y-3">
            {result.first_aid_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-navy-900 text-cream text-xs font-body font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="font-body text-sm text-navy-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Doctor Questions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-navy-900">Questions to Ask Your Doctor</h2>
            <span className="text-xs text-navy-600/40 font-body">Tap to check off</span>
          </div>
          <ul className="space-y-2.5">
            {result.doctor_questions.map((q, i) => (
              <li
                key={i}
                onClick={() => toggleCheck(i)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all
                  ${checked[i] ? 'bg-sage-400/10' : 'hover:bg-parchment'}`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                  ${checked[i] ? 'bg-sage-400 text-navy-900' : 'border border-navy-900/20'}`}>
                  {checked[i] && <CheckCircle2 size={14} />}
                </div>
                <p className={`font-body text-sm leading-relaxed transition-colors
                  ${checked[i] ? 'text-navy-600/50 line-through' : 'text-navy-700'}`}>
                  {q.replace('→ ', '')}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Score Breakdown */}
        <div className="card p-5">
          <h2 className="font-display text-lg text-navy-900 mb-4">Score Breakdown</h2>
          <div className="space-y-2">
            {result.scoreBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm font-body">
                <span className="text-navy-700">{item.label}</span>
                <span className="font-mono text-navy-900 font-medium">+{item.points}</span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-parchment flex items-center justify-between text-sm font-body font-semibold">
              <span className="text-navy-900">Total Risk Score</span>
              <span className="font-mono text-navy-900">{result.score}/100</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Link to="/hospitals" className="btn-primary flex-1 justify-center py-3">
            <MapPin size={16} /> Find Nearby Hospital
          </Link>
          <button onClick={() => navigate('/assess')} className="btn-outline flex-1 justify-center py-3">
            <RefreshCw size={16} /> New Assessment
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-navy-900/5 rounded-2xl p-4 text-xs text-navy-600/50 font-body leading-relaxed text-center">
          This assessment is for informational purposes only and does not constitute medical advice, diagnosis, or treatment.
          Always seek the advice of your physician or a qualified healthcare provider with any questions regarding a medical condition.
        </div>
      </div>
    </div>
  )
}
