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

## 📡 API Endpoints

- `GET /movies/`: Fetch list of all movies.
- `GET /reviews/{id}`: Get reviews for a specific movie.
- `POST /watchlist/`: Add a movie to user's pull list (Requires Auth).
- `GET /reviews/user/{user_id}`: Get all reviews submitted by a specific user (Requires Auth).

---
© 2026 CosQ Entertainments Pvt. Ltd. All Rights Reserved.
