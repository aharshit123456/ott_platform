# WHAM! OTT Platform 🛡️✨

A high-performance "Living Comic Book" OTT application developed by **CosQ Entertainments Pvt. Ltd.** 

## 🚀 Overview

WHAM! is a discovery network for freelance media production: video, sound, motion, photo and reels. Every piece of work lists who made it, so watching the work leads you to the right person and a quick ping to start something new.

**Watch → Find → Connect**

- **Discover** (`/discover`): three lenses (Work, People, Gigs) with a discipline filter across all of them.
- **Work** (`/work/:id`): every credit links to the person and is verified by a collaborator.
- **Profiles** (`/people/:id`): showreel, availability calendar, reply time, turnaround, gear and often-works-with.
- **Shortlists** (`/lists`): named per idea ("Perfume ad", "Podcast promo"); add people from anywhere.
- **Pings and Inbox** (`/inbox`): a quick "Interested?" first, details after they reply.
- **Gigs**: short public briefs anyone can post or respond to.
- **Landing** (`/`): desktop visitors see the hero and sign up / log in (Supabase auth). Phones open straight into Discover.

Seed people, work and gigs live in `src/wham/data.js`, and shortlists, pings and replies are client-side and simulated for now.

### ⚠️ Deprecated: WHAM! OTT Classic

The original comic-book streaming app now lives under `/legacy` (`src/legacy/`) with a deprecation banner and will be removed. Old URLs (`/watch/:id`, `/pull-list`, `/profile`) redirect there; `/login` and `/signup` open the new auth dialog. Do not add features to `src/legacy/`.

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
