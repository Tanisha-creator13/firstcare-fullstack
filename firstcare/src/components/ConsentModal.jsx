import { ShieldCheck, Lock, AlertCircle } from 'lucide-react'

export default function ConsentModal({ onAccept }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-sage-100 rounded-lg text-sage-600">
            <ShieldCheck size={28} />
          </div>
          <h2 className="font-display text-2xl text-navy-900">Privacy & Ethics</h2>
        </div>

        <div className="space-y-4 font-body text-sm text-navy-700 mb-8">
          <div className="flex gap-3">
            <Lock className="text-navy-400 shrink-0" size={18} />
            <p><strong>Privacy:</strong> Your data is processed via encrypted channels. We do not store personally identifiable health information.</p>
          </div>
          <div className="flex gap-3">
            <AlertCircle className="text-navy-400 shrink-0" size={18} />
            <p><strong>Not a Doctor:</strong> This is an AI triage tool, not a diagnosis. In a real emergency, always call 911 immediately.</p>
          </div>
        </div>

        <button 
          onClick={onAccept}
          className="w-full btn-primary bg-navy-900 text-cream py-4 rounded-xl font-bold hover:bg-navy-800 transition-all"
        >
          I Understand & Consent
        </button>
      </div>
    </div>
  )
}