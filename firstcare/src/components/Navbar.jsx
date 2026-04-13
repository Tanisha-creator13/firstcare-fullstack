import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Activity, BookOpen, MapPin, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { to: '/assess', label: 'Assess', icon: Activity },
    { to: '/library', label: 'First Aid', icon: BookOpen },
    { to: '/hospitals', label: 'Hospitals', icon: MapPin },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Disclaimer */}
      <div className="disclaimer-banner text-center text-xs text-cream/70 py-1.5 font-body tracking-wide">
        ⚕️ &nbsp;This app does not provide medical diagnosis. Always consult a qualified healthcare professional.
      </div>

      <nav className="bg-navy-900 sticky top-0 z-50 shadow-xl shadow-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-sage-400 flex items-center justify-center text-navy-900 font-display font-bold text-sm">
              F
            </div>
            <span className="font-display font-semibold text-cream text-base tracking-wide">
              First<span className="text-sage-400">Care</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-colors
                  ${isActive(to)
                    ? 'bg-white/10 text-cream'
                    : 'text-cream/60 hover:text-cream hover:bg-white/5'}`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-colors
                    ${isActive('/dashboard') ? 'bg-white/10 text-cream' : 'text-cream/60 hover:text-cream hover:bg-white/5'}`}
                >
                  <User size={14} />
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-cream/40 hover:text-cream/70 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-cream/60 hover:text-cream text-sm font-body transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link to="/signup" className="bg-sage-400 text-navy-900 text-sm font-body font-medium px-4 py-1.5 rounded-lg hover:bg-sage-500 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-cream/70 hover:text-cream p-1"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-navy-800 border-t border-white/5 px-4 py-3 flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cream/70 hover:text-cream hover:bg-white/5 transition-colors"
              >
                <Icon size={15} />{label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cream/70 hover:text-cream">
                  <User size={15} />Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cream/40 hover:text-cream/70 text-left">
                  <LogOut size={15} />Sign out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cream/70 hover:text-cream">
                Sign in
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
