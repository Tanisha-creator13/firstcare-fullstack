// src/api/client.js
// Central API client — all fetch calls go through here.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  const user = localStorage.getItem('fc_user')
  return user ? JSON.parse(user).token : null
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiSignup = (body) =>
  request('/auth/signup', { method: 'POST', body: JSON.stringify(body) })

export const apiLogin = (body) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(body) })

// ── Triage ────────────────────────────────────────────────────────────────────
export const apiTriage = (body) =>
  request('/triage', { method: 'POST', body: JSON.stringify(body) })

// ── Sessions ──────────────────────────────────────────────────────────────────
export const apiGetSessions = () => request('/sessions')
export const apiGetSession = (id) => request(`/sessions/${id}`)
export const apiDeleteSessions = () => request('/sessions', { method: 'DELETE' })

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const apiDashboardStats = () => request('/dashboard/stats')

// ── Library ───────────────────────────────────────────────────────────────────
export const apiGetLibrary = (search = '', category = '') => {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category && category !== 'All') params.set('category', category)
  return request(`/library?${params}`)
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const apiGetProfile = () => request('/profile')
export const apiUpdateProfile = (body) =>
  request('/profile', { method: 'PUT', body: JSON.stringify(body) })
export const apiChangePassword = (body) =>
  request('/profile/password', { method: 'PUT', body: JSON.stringify(body) })
