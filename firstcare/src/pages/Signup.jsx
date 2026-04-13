import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiSignup } from '../api/client'

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) return setError('Please fill all fields.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      if (import.meta.env.VITE_API_URL) {
        const data = await apiSignup({ name: form.name, email: form.email, password: form.password })
        login({ email: data.email, name: data.name, token: data.access_token })
      } else {
        await new Promise(r => setTimeout(r, 900))
        login({ email: form.email, name: form.name, token: 'mock-token' })
      }
      navigate('/assess')
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 flex items-center justify-center text-sage-400 font-display font-bold text-xl mx-auto mb-4">F</div>
          <h1 className="font-display text-3xl text-navy-900 mb-1">Create account</h1>
          <p className="text-navy-600/50 font-body text-sm">Get personalized triage guidance</p>
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-body">
              {error}
            </div>
          )}

          <div>
            <label className="label">Full name</label>
            <input type="text" name="name" value={form.name} onChange={handle}
              placeholder="Arjun Sharma" className="input-field" />
          </div>

          <div>
            <label className="label">Email address</label>
            <input type="email" name="email" value={form.email} onChange={handle}
              placeholder="you@example.com" className="input-field" />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} name="password" value={form.password} onChange={handle}
                placeholder="Min. 6 characters" className="input-field pr-10" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-600/40 hover:text-navy-600">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">Confirm password</label>
            <input type="password" name="confirm" value={form.confirm} onChange={handle}
              placeholder="••••••••" className="input-field" />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account…
              </span>
            ) : (
              <><UserPlus size={16} /> Create Account</>
            )}
          </button>

          <p className="text-center text-sm font-body text-navy-600/50">
            Already have an account?{' '}
            <Link to="/login" className="text-navy-800 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
