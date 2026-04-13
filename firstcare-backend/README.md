# FirstCare Backend — FastAPI

Medical triage REST API powering the FirstCare frontend.

## Stack
- **FastAPI** — async Python web framework
- **PostgreSQL** — persistent database (via SQLAlchemy ORM)
- **Alembic** — database migrations
- **Google Gemini** (`gemini-1.5-flash`) — AI guidance generation
- **JWT** — stateless authentication (python-jose)
- **bcrypt** — password hashing (passlib)
- **slowapi** — rate limiting

---

## Project Structure

```
firstcare-backend/
├── main.py              # FastAPI app, CORS, startup, router registration
├── config.py            # Settings loaded from .env (pydantic-settings)
├── database.py          # SQLAlchemy engine + session + Base
├── models.py            # ORM models (User, SymptomSession, Library, Rules)
├── schemas.py           # Pydantic request/response models
├── auth.py              # JWT creation/decoding, password hashing, get_current_user
├── triage_engine.py     # Full triage logic: red flags → scoring → Gemini → safety layer
├── seed_library.py      # Seeds 20 first-aid library entries on startup
├── requirements.txt
├── .env.example
└── routers/
    ├── auth.py          # POST /auth/signup, /auth/login
    ├── triage.py        # POST /triage  (protected)
    ├── sessions.py      # GET/DELETE /sessions, GET /sessions/{id}
    ├── dashboard.py     # GET /dashboard/stats
    ├── library.py       # GET /library (with ?search= and ?category=)
    └── profile.py       # GET/PUT /profile, PUT /profile/password
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | Health check |
| POST | `/auth/signup` | — | Register, returns JWT |
| POST | `/auth/login` | — | Login, returns JWT |
| POST | `/triage` | ✅ | Full triage — runs engine + Gemini |
| GET | `/sessions` | ✅ | All sessions for current user |
| GET | `/sessions/{id}` | ✅ | Single session detail |
| DELETE | `/sessions` | ✅ | Delete all user sessions |
| GET | `/dashboard/stats` | ✅ | Aggregated stats for charts |
| GET | `/library` | — | First aid library (searchable) |
| GET | `/profile` | ✅ | Current user profile |
| PUT | `/profile` | ✅ | Update name/email/anonymous mode |
| PUT | `/profile/password` | ✅ | Change password |

Interactive docs at `/docs` (Swagger UI) and `/redoc`.

---

## Local Development Setup

### 1. Prerequisites
- Python 3.11+
- PostgreSQL running locally (or use a free Render/Supabase DB)
- Gemini API key (free at https://aistudio.google.com)

### 2. Install dependencies
```bash
cd firstcare-backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your values:
nano .env
```

Required values:
```
GEMINI_API_KEY=your_key_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/firstcare
JWT_SECRET=some_long_random_string
```

### 4. Create the database
```bash
# In psql or pgAdmin:
CREATE DATABASE firstcare;
```

### 5. Run the server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

On first run, the app automatically:
- Creates all database tables
- Seeds 20 first-aid library entries
- Starts accepting requests

Visit http://localhost:8000/docs to test all endpoints.

---

## Triage Engine Logic (`triage_engine.py`)

```
Input (TriageRequest)
    │
    ▼
Step 2 — Red Flag Detection (regex, instant)
    │  12 emergency patterns: cardiac, stroke, anaphylaxis, etc.
    │  Any match → EMERGENCY immediately (skip scoring)
    │
    ▼
Step 3 — Risk Scoring
    │  Severity:   (severity − 1) × 4.5    → 0–40 pts
    │  Duration:   minutes=3 … over_week=14
    │  Age:        <2 or >75=15, <12 or >60=8
    │  Conditions: heart_disease=18, diabetes=10, asthma=10, etc.
    │  Keywords:   blood in stool=14, high fever=12, etc.
    │
    ▼
Score → Category
    │  ≥60 → EMERGENCY
    │  ≥40 → URGENT
    │  ≥20 → MONITOR
    │   <20 → LOW_RISK
    │
    ▼
Step 4 — Gemini API (gemini-1.5-flash)
    │  Sends: patient profile + triage result
    │  Gets JSON: explanation + first_aid_steps[4] + doctor_questions[5]
    │  Falls back to pre-written guidance if API fails
    │
    ▼
Step 5 — Safety Layer
    │  Strip diagnostic language via regex
    │  Prepend "Call 112/911" for EMERGENCY
    │
    ▼
Save to DB → Return TriageResponse
```

---

## Deployment on Render (Free Tier)

### Backend
1. Push `firstcare-backend/` to a GitHub repo
2. Create a new **Web Service** on Render
3. Set:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (from `.env.example`)
5. Create a free **PostgreSQL** database on Render, copy the `DATABASE_URL`

### Frontend
1. Set `VITE_API_URL=https://your-backend.onrender.com` in Netlify env vars
2. Deploy the `firstcare/` folder to Netlify

---

## Security Notes

- Gemini API key is **server-side only** — never exposed to frontend
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire after 24 hours (configurable)
- Rate limits: 20/min on `/triage`, 10/min on `/auth/login`
- CORS restricted to `FRONTEND_ORIGIN` in production
- All inputs validated by Pydantic before processing

---

## Disclaimer

This application does not provide medical diagnosis or replace professional medical advice.
In an emergency, always call 112 or 911.
