import { useNavigate, Link } from 'react-router-dom'
import { useTriage } from '../context/TriageContext'
import { MapPin, RefreshCw, AlertTriangle, CheckCircle2, Phone, ShieldAlert, Brain } from 'lucide-react'
import { useState } from 'react'

const URGENCY_META = {
  EMERGENCY: {
    banner: 'bg-red-600 text-white animate-pulse-slow', // Added slow pulse for visual urgency
    badge: 'bg-red-100 text-red-800 border-red-200',
    icon: '🚨',
    title: 'CRITICAL EMERGENCY',
    subtitle: 'Seek immediate medical attention',
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
  const isEmergency = result.category === 'EMERGENCY'

  return (
    <div className={`min-h-screen ${isEmergency ? 'bg-red-50/30' : 'bg-parchment'} pb-16 transition-colors duration-500`}>
      
      {/* Urgency Banner */}
      <div className={`${meta.banner} py-8 px-4 text-center shadow-lg`}>
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-4xl mb-2">{meta.icon}</span>
          <h1 className="font-display text-3xl font-black tracking-tight">{meta.title}</h1>
          <p className="font-body text-lg opacity-90">{meta.subtitle}</p>
          
          {isEmergency && (
            <button 
              onClick={() => window.open('tel:911')}
              className="mt-6 flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-full font-black shadow-xl hover:scale-105 transition-transform"
            >
              <Phone size={20} fill="currentColor" /> CALL 911 NOW
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-5">
        
        {/* Transparency Badge: Explain WHERE the decision came from */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-body font-medium ${meta.badge}`}>
            {result.scoreBreakdown?.['Safety Filter'] ? (
              <ShieldAlert size={14} className="text-red-600" />
            ) : (
              <Brain size={14} className="text-blue-600" />
            )}
            Source: {result.scoreBreakdown?.['Safety Filter'] ? 'Manual Safety Interceptor' : 'AI Reasoning Model'}
          </div>
          <button onClick={() => navigate('/assess')} className="btn-outline text-xs py-1.5 px-3">
            <RefreshCw size={12} /> Restart
          </button>
        </div>

        {/* Red Flags - Critical Safety (D5) */}
        {result.redFlags && result.redFlags.length > 0 && (
          <div className="card p-5 border-l-4 border-red-500 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-600" />
              <h2 className="font-display text-lg text-red-800 font-bold">Critical Indicators</h2>
            </div>
            <ul className="space-y-2">
              {result.redFlags.map((rf, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700 font-body font-medium">
                  <span className="text-red-500">•</span> {rf}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explainability Block - Addressing "Black Box" Logic (D3) */}
        <div className="card p-5 bg-white border border-navy-100">
          <div className="flex items-center gap-2 mb-3 text-navy-900">
            <Brain size={18} className="text-blue-500" />
            <h2 className="font-display text-lg font-bold">AI Clinical Reasoning</h2>
          </div>
          <p className="font-body text-sm text-navy-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 italic">
            "{result.explanation}"
          </p>
        </div>

        {/* First Aid - Actionable Harm Prevention (D5) */}
        <div className="card p-5 bg-white">
          <h2 className="font-display text-lg text-navy-900 mb-4 font-bold">Immediate Safety Steps</h2>
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

        {/* Doctor Questions - Bridge to Human Care (D4) */}
        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-navy-900 font-bold">Doctor Consultation Prep</h2>
            <span className="text-[10px] uppercase tracking-widest text-navy-400 font-bold">Patient Checklist</span>
          </div>
          <ul className="space-y-2.5">
            {result.doctor_questions.map((q, i) => (
              <li
                key={i}
                onClick={() => toggleCheck(i)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border
                  ${checked[i] ? 'bg-sage-50 border-sage-200' : 'bg-parchment/30 border-transparent hover:border-navy-100'}`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                  ${checked[i] ? 'bg-sage-400 text-navy-900' : 'border border-navy-900/20 bg-white'}`}>
                  {checked[i] && <CheckCircle2 size={14} />}
                </div>
                <p className={`font-body text-sm leading-relaxed transition-colors
                  ${checked[i] ? 'text-navy-400 line-through' : 'text-navy-700 font-medium'}`}>
                  {q.replace('→ ', '')}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Link to="/hospitals" className="btn-primary flex-1 justify-center py-4 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition-all">
            <MapPin size={18} /> Find Local Care
          </Link>
          <button 
            onClick={() => window.print()} 
            className="btn-outline flex-1 justify-center py-4 border-navy-900 text-navy-900 rounded-xl font-bold hover:bg-navy-50"
          >
             Export Report
          </button>
        </div>

        {/* Ethical Accountability Footer */}
        <div className="bg-navy-900 text-white/60 rounded-2xl p-6 text-[10px] font-body leading-relaxed text-center uppercase tracking-wider">
          <p className="mb-2 text-white/90 font-bold">Accountability Statement</p>
          This triage report was generated by an AI model. It is not a diagnosis. 
          By using this tool, you acknowledge that the developers are not liable for 
          decisions made based on this guidance. Always prioritize the advice of a 
          physically present medical professional.
        </div>
      </div>
    </div>
  )
}