import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiLogin } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) return setError('Please fill all fields.')
    setLoading(true)
    try {
      if (import.meta.env.VITE_API_URL) {
        const data = await apiLogin({ email: form.email, password: form.password })
        login({ email: data.email, name: data.name, token: data.access_token })
      } else {
        // Prototype mode: mock login
        await new Promise(r => setTimeout(r, 800))
        login({ email: form.email, name: form.email.split('@')[0], token: 'mock-token' })
      }
      navigate('/assess')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 flex items-center justify-center text-sage-400 font-display font-bold text-xl mx-auto mb-4">F</div>
          <h1 className="font-display text-3xl text-navy-900 mb-1">Welcome back</h1>
          <p className="text-navy-600/50 font-body text-sm">Sign in to your FirstCare account</p>
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-body">
              {error}
            </div>
          )}

          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handle}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handle}
                placeholder="••••••••"
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-600/40 hover:text-navy-600"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </span>
            ) : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>

          <p className="text-center text-sm font-body text-navy-600/50">
            Don't have an account?{' '}
            <Link to="/signup" className="text-navy-800 font-medium hover:underline">Sign up</Link>
          </p>
        </form>

        {/* Demo note */}
        <p className="text-center text-xs text-navy-600/30 font-body mt-4">
          Prototype — any email & password will work
        </p>
      </div>
    </div>
  )
}
