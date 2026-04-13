import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Brain, FileText, ChevronDown, ShieldCheck } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-navy-900 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #4ecdc4 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sage-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-ember-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-cream/60 font-body tracking-widest uppercase mb-8">
            <ShieldCheck size={12} className="text-sage-400" />
            AI-Assisted Medical Triage
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-cream leading-[1.05] mb-6">
            Know what to do<br />
            <span className="text-sage-400">when symptoms strike</span>
          </h1>

          <p className="text-cream/50 font-body text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Describe your symptoms and receive an urgency classification, first-aid guidance,
            and doctor preparation — in under a minute.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/assess" className="btn-primary bg-sage-400 text-navy-900 hover:bg-sage-500 text-base px-8 py-4">
              Check My Symptoms <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-outline border-white/20 text-cream/70 hover:bg-white/5 hover:text-cream hover:border-white/40 text-base px-8 py-4">
              How It Works <ChevronDown size={18} />
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 mt-16 text-center">
            {[
              { val: '< 60s', label: 'Triage time' },
              { val: '4 Levels', label: 'Urgency scale' },
              { val: '20+', label: 'First aid guides' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display text-3xl text-sage-400 font-semibold">{s.val}</div>
                <div className="text-cream/40 font-body text-xs tracking-widest uppercase mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-cream py-20">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'Fast Triage',
              desc: 'Rule-based red flag detection runs instantly before AI, catching emergencies the moment you submit.',
              color: 'text-ember-500',
              bg: 'bg-ember-500/10',
            },
            {
              icon: Brain,
              title: 'AI-Powered Guidance',
              desc: 'Gemini AI generates personalized plain-English explanations, first-aid steps, and doctor questions for your specific situation.',
              color: 'text-sage-400',
              bg: 'bg-sage-400/10',
            },
            {
              icon: FileText,
              title: 'Doctor Prep',
              desc: 'Walk into your appointment with the right questions already prepared — five targeted questions tailored to your symptoms.',
              color: 'text-navy-600',
              bg: 'bg-navy-600/10',
            },
          ].map(f => (
            <div key={f.title} className="card p-6">
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon size={20} className={f.color} />
              </div>
              <h3 className="font-display text-xl text-navy-900 mb-2">{f.title}</h3>
              <p className="text-navy-600/70 font-body text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-parchment py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl text-navy-900 mb-3">How It Works</h2>
            <p className="text-navy-600/60 font-body">Four steps from symptoms to guidance</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-parchment border-t border-dashed border-navy-800/20" />

            {[
              { n: '01', title: 'Fill the form', desc: 'Enter age, conditions, symptoms, severity, and duration.' },
              { n: '02', title: 'AI analyzes', desc: 'Red flag rules run first; then Gemini evaluates your full context.' },
              { n: '03', title: 'Get guidance', desc: 'Receive urgency level, first-aid steps, and doctor questions.' },
              { n: '04', title: 'See your doctor', desc: 'Use your prepared questions and find the nearest clinic.' },
            ].map(step => (
              <div key={step.n} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-navy-900 text-cream font-display text-lg font-semibold flex items-center justify-center mx-auto mb-4 relative z-10">
                  {step.n}
                </div>
                <h4 className="font-body font-semibold text-navy-900 mb-1 text-sm">{step.title}</h4>
                <p className="font-body text-xs text-navy-600/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 py-16 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-3xl text-cream mb-4">Ready to get started?</h2>
          <p className="text-cream/40 font-body text-sm mb-8">No subscription needed. Completely free to use.</p>
          <Link to="/assess" className="btn-primary bg-sage-400 text-navy-900 hover:bg-sage-500 text-base px-8 py-4">
            Start Assessment <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 border-t border-white/5 py-6 text-center">
        <p className="text-cream/30 font-body text-xs">
          © 2026 FirstCare · This application does not provide medical diagnosis or replace professional medical advice.
          In an emergency, always call 112 or 911.
        </p>
      </footer>
    </div>
  )
}
