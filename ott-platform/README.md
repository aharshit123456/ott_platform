# WHAM! OTT Platform 🛡️✨

A high-performance "Living Comic Book" OTT application developed by **CosQ Entertainments Pvt. Ltd.** 

## 🚀 Overview

WHAM! OTT is a unique streaming platform designed with a vibrant comic book aesthetic. Built using React, Vite, and Capacitor for a seamless cross-platform experience (Web & Android).

### 🎨 Key Features
- **Comic Book Aesthetic**: Custom-designed UI featuring "Living Comic" panels, speech bubbles, and kinetic typography.
- **FastPix Integration**: High-performance video streaming with prioritized Largest Contentful Paint (LCP).
- **Social Features**: Interactive review system ("Rants"), user ratings, and personal "Pull Lists" (Watchlists).
- **Cross-Platform**: Operates as a responsive web app and a native Android application via Capacitor.
- **Secure Backend**: Python FastAPI backend with token forwarding and Supabase RLS (Row Level Security) for data protection.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Vanilla CSS
- **Backend**: Python FastAPI, SQLAlchemy (Metadata), Supabase Client
- **Database/Auth**: Supabase (PostgreSQL)
- **Mobile**: Capacitor JS
- **Video**: FastPix Player

## 📂 Project Structure

- `/ott-platform`: React frontend and Capacitor configuration.
- `/ott-backend`: FastAPI service for movie metadata, reviews, and user watchlist management.

## ⚙️ Setup & Installation

### Backend
1. `cd ott-backend`
2. `pip install -r requirements.txt`
3. Configure `.env` with Supabase/FastPix keys.
4. `uvicorn main:app --reload`

### Frontend
1. `cd ott-platform`
2. `npm install`
3. `npm run dev`

### Mobile (Android)
1. `npm run build`
2. `npx cap sync android`
3. `npx cap open android` (Requires Android Studio)

---
© 2026 CosQ Entertainments Pvt. Ltd. All Rights Reserved.
