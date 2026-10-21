# WHAM! OTT Platform - Master Repository 🛡️✨

Welcome to the official repository for **WHAM!**, a discovery network for freelance video, sound, motion and photo creators, brought to you by **CosQ Entertainments Pvt. Ltd.** Watch the work, find the people who made it, and ping them to make the next thing.

> The original comic-book streaming app (WHAM! OTT Classic) is **deprecated**. It is still served under `/legacy` and will be removed.

## 📂 Repository Structure

This project is divided into two main components:

- **[Frontend (ott-platform)](./ott-platform)**: A cross-platform mobile and web application built with React 19, Vite, and Capacitor JS. The new WHAM! app lives in `src/wham/`; the deprecated classic OTT app lives in `src/legacy/`.
- **[Backend (ott-backend)](./ott-backend)**: A high-performance Python FastAPI service. Handles movie metadata, user reviews, watchlist logic, and secure Supabase integration with Row Level Security (RLS).

## 🚀 Quick Start

To get the full system running locally, follow the setup guides in each subdirectory:

1.  **Backend Setup**: Follow the instruction in [ott-backend/README.md](./ott-backend/README.md) to start the API.
2.  **Frontend Setup**: Follow the instructions in [ott-platform/README.md](./ott-platform/README.md) to start the UI and connect it to the backend.

## 📱 Mobile Support

The platform is optimized for Android devices via Capacitor. You can find pre-built APKs in the build outputs or follow the build instructions in the frontend directory.

---
© 2026 CosQ Entertainments Pvt. Ltd. All Rights Reserved.
