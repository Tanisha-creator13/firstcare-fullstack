import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center text-center px-4">
      <div>
        <p className="font-mono text-8xl text-navy-900/10 font-bold mb-4">404</p>
        <h1 className="font-display text-3xl text-navy-900 mb-2">Page not found</h1>
        <p className="text-navy-600/50 font-body text-sm mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  )
}
