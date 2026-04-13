# FirstCare — Medical Triage Assistant (Prototype)

A professional frontend prototype for an AI-assisted first-aid and medical triage web app.

## Stack
- **React 18** + React Router v6
- **Tailwind CSS** (custom config with design tokens)
- **Recharts** (dashboard charts)
- **Leaflet.js + OpenStreetMap + Overpass API** (hospital finder — no API key needed)
- **Vite** (build tool)

## Features Implemented
| Screen | Route | Notes |
|--------|-------|-------|
| Landing Page | `/` | Hero, features, how-it-works, CTA |
| Login | `/login` | JWT-ready (mocked for prototype) |
| Signup | `/signup` | Form validation, bcrypt-ready |
| Symptom Assessment | `/assess` | 3-step form with progress bar |
| Triage Results | `/results` | Urgency banner, first-aid, doctor questions, score breakdown |
| Dashboard | `/dashboard` | Charts (pie + line), sessions table |
| First Aid Library | `/library` | 20 conditions, search + filter, expandable cards |
| Hospital Finder | `/hospitals` | Live Leaflet map + Overpass API (real data, no key needed) |

## Triage Engine (src/data/triageEngine.js)
Runs entirely in the browser for the prototype — mirrors the FastAPI backend logic:
1. **Red flag regex patterns** → instant EMERGENCY override
2. **Risk scoring** — severity, duration, age, conditions, keywords
3. **Category thresholds** — EMERGENCY / URGENT / MONITOR / LOW_RISK
4. **Pre-written guidance** per category (replace with real Gemini API call in production)

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Connecting the Real Backend (Production)

### 1. Gemini AI (replace mock guidance)
```js
// In triageEngine.js → generateGuidance(), replace with:
const response = await fetch('https://api.anthropic.com/...') // your FastAPI endpoint
```

### 2. Auth (replace localStorage mock)
```js
// In AuthContext.jsx → login(), replace with:
const res = await fetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
const { token } = await res.json()
localStorage.setItem('token', token)
```

### 3. Real triage endpoint
```js
// In Assess.jsx → submit(), replace runTriage(form) with:
const res = await fetch('/triage', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(form)
})
const result = await res.json()
```

## Environment Variables (for production backend)
```
GEMINI_API_KEY=       # from aistudio.google.com (free)
DATABASE_URL=         # Render PostgreSQL
JWT_SECRET=           # any random string
```

## Design Tokens
- **Display font**: Playfair Display (serif)
- **Body font**: DM Sans (sans-serif)
- **Mono font**: JetBrains Mono
- **Primary dark**: `navy-900` (#0a0f1e)
- **Accent teal**: `sage-400` (#4ecdc4)
- **Emergency red**: `ember-500` (#ff4e2a)
- **Background**: `cream` (#f7f4ef)

## Disclaimer
This application does not provide medical diagnosis or replace professional medical advice.
Always call 112 or 911 in an emergency.
