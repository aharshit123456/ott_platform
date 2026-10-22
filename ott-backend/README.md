# WHAM! OTT Backend - API Service 🛡️⚙️

The core API service for the WHAM! OTT Platform, powered by **CosQ Entertainments Pvt. Ltd.**

## 🚀 Features

- **FastAPI Core**: High-performance asynchronous API endpoints.
- **Supabase Integration**: Secure database operations using Supabase Python SDK.
- **Auth Token Forwarding**: Securely handles user sessions to work with Row Level Security (RLS) policies.
- **Movie Management**: Metadata handling for movies, including FastPix media and playback IDs.
- **Social Engine**: Endpoints for submitting/retrieving reviews ("Rants") and managing user "Pull Lists" (Watchlists).
- **CORS Enabled**: Configured for secure communication with the frontend across web and mobile.

## 🛠️ Prerequisites

- Python 3.9+
- Pip (Python Package Manager)

## ⚙️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file in this directory with the following:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_role_or_anon_key
   FASTPIX_ACCESS_TOKEN_ID=your_fastpix_token
   FASTPIX_SECRET_KEY=your_fastpix_secret
   ```

3. **Run the Server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## 🎬 WHAM! freelance network API (`/wham`)

Backs the new WHAM! app: profiles, credited work, gigs, shortlists and pings. Code lives in `wham/`.

- **Storage:** SQLAlchemy on the same engine as the rest of the API, so it uses Supabase Postgres when reachable and the local SQLite fallback otherwise. Tables (`wham_*`) are created on startup. On Postgres, row level security is switched on with no policies, so the tables can't be read or written through Supabase's public REST API, only through this backend.
- **Auth:** send `Authorization: Bearer <token>`: the Supabase session token normally, or the token from `/auth/login` on the SQLite fallback. Reads (`GET /wham/works`, `/people`, `/gigs`) are public. Everything else needs a token, and most writes need a WHAM! profile first (`PUT /wham/me`).
- **Sample data:** `python -m wham.seed` loads the invented creators, work and gigs from the design. It's safe to run twice. Sample profiles have ids starting with `seed-` and no login.

| Endpoint | What it does |
| --- | --- |
| `GET /wham/disciplines` | The discipline list used for filters |
| `GET /wham/me` · `PUT /wham/me` | Read / create-or-update your profile (availability, gear, reel, turnaround…) |
| `GET /wham/people?discipline=` · `GET /wham/people/{id}` | Browse people; a profile includes 6-week availability, credited work, verified credit count and frequent collaborators |
| `GET /wham/works?discipline=` · `GET /wham/works/{id}` · `POST /wham/works` | Browse work with its credits; add work with your role and your collaborators' roles |
| `POST /wham/works/{id}/credits` · `POST …/credits/{person}/verify` · `DELETE …/credits/{person}` | Credit someone, verify a collaborator's credit, or remove a credit |
| `GET /wham/gigs?discipline=` · `POST /wham/gigs` · `DELETE /wham/gigs/{id}` · `POST /wham/gigs/{id}/respond` | Browse, post, close and respond to gigs |
| `GET/POST /wham/shortlists` · `DELETE /wham/shortlists/{id}` · `PUT/DELETE /wham/shortlists/{id}/people/{person}` | Named shortlists per idea |
| `POST /wham/pings` · `GET /wham/inbox` · `GET /wham/conversations/{id}` | Send an "Interested?" ping (one thread per pair of people), list threads with unread counts, read a thread (marks it read) |
| `POST /wham/conversations/{id}/reply` | The pinged person answers: interested, or booked and ping me later |
| `POST /wham/conversations/{id}/details` · `POST /wham/conversations/{id}/messages` | Share job details / send messages once they've said they're interested |

**How credits are verified:** a credit you add for a collaborator counts as verified by you. Your own credit needs another person credited on the same work to verify it.

### Tests

```bash
pip install -r requirements-dev.txt
pytest tests
```

The tests run on a throwaway SQLite database, using real `/auth/signup` and `/auth/login` tokens.

## 📡 API Endpoints (WHAM! OTT Classic, deprecated)

- `GET /movies/`: Fetch list of all movies.
- `GET /reviews/{id}`: Get reviews for a specific movie.
- `POST /watchlist/`: Add a movie to user's pull list (Requires Auth).
- `GET /reviews/user/{user_id}`: Get all reviews submitted by a specific user (Requires Auth).

---
© 2026 CosQ Entertainments Pvt. Ltd. All Rights Reserved.
