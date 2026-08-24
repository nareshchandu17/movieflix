<div align="center">
  <img src="https://raw.githubusercontent.com/nareshchandu17/movieflix/main/public/logo.png" alt="MovieFlix Logo" width="200" onerror="this.style.display='none'"/>
  
  # 🍿 MovieFlix
  
  **Your Premium Netflix-Style Streaming Experience**

  [![Cypress E2E Tests](https://github.com/nareshchandu17/movieflix/actions/workflows/cypress.yml/badge.svg)](https://github.com/nareshchandu17/movieflix/actions/workflows/cypress.yml) [![Lint & Type Check](https://github.com/nareshchandu17/movieflix/actions/workflows/ci.yml/badge.svg)](https://github.com/nareshchandu17/movieflix/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  *A modern, AI-powered OTT platform that redefines how you discover, share, and enjoy cinematic content.*
</div>

---

## ✨ The Vision

We built **MovieFlix** to bridge the gap between traditional streaming and modern, social-first viewing. It’s not just about watching a movie; it’s about discovering exactly what fits your mood using AI, watching it synchronously with your friends across the globe, and experiencing a buttery-smooth, premium user interface inspired by the industry leaders.

---

## 🚀 Epic Features

### 🎬 A Cinematic Core
- **Dynamic Auto-playing Trailers**: Hero sections that come alive the moment you land, complete with smooth, theatrical transitions.
- **Lightning-Fast Search**: Instantly find movies, series, or your favorite actors without reloading the page.
- **Curated Trending Content**: Stay in the loop with real-time "New & Popular" and "Top Web Series" categorizations.

### 🧠 Google AI Integration
- **Mood-Based Discovery**: Tell us how you feel, and our AI engine will curate the perfect watchlist.
- **Smart Summaries & Character Deep Dives**: Get AI-generated, spoiler-free insights and deep analyses of characters and actors.

### 🍿 Social & Watch Parties (Real-time!)
- **Synchronized Watch Parties**: Invite friends to a virtual theater. Play, pause, and seek are synced across all screens in real-time via WebSockets.
- **Live Reactions**: Express yourself during jaw-dropping scenes with floating emoji reactions.
- **Personalized Profiles**: Track your watch history, save favorites to "My List", and earn streaks for watching together.

---

## 🏗 System Architecture

To deliver a buffer-free, real-time experience, MovieFlix relies on a highly decoupled, modern stack.

```text
                  ┌────────────────────┐
                  │   Next.js Client   │ (React, Zustand, Tailwind)
                  └─────────┬──────────┘
                            │ HTTP / WebSockets
                            ▼
                  ┌────────────────────┐
                  │  Next.js Edge API  │ (App Router API Gateway)
                  └────┬───────────┬───┘
                       │           │
       Mongoose / HTTP │           │ WebSockets / Redis
                       ▼           ▼
             ┌───────────┐       ┌──────────────┐
             │  MongoDB  │       │  Socket.io   │
             │ (Storage) │       │ (Real-time)  │
             └───────────┘       └──────────────┘

External Integrations:
• TMDB API ─── Movie metadata and media assets
• Google AI ── Mood analysis and content insights
• Stripe ───── Secure, lifecycle-managed subscriptions
• Cloudinary ─ Avatar and media storage
```

### 📂 Repository Structure

```text
movieflix/
├── app/                  # Next.js App Router (Pages & API)
│   ├── (auth)/           # Secure authentication flows
│   ├── movie/            # Dynamic movie details
│   ├── watch-party/      # Real-time WebSocket rooms
│   └── api/              # Edge and Serverless API endpoints
├── components/           # Modular React UI
│   ├── carousels/        # Touch-friendly content sliders
│   ├── player/           # Custom cinematic video player
│   └── ui/               # Reusable Tailwind components
├── features/             # Domain-driven feature modules (Movies, Social, Auth)
├── lib/                  # Core utilities (DB connection, security)
└── services/             # External API wrappers (TMDB, AI, Billing)
```

---

## 🛡 Security & Billing

MovieFlix isn't just a prototype—it's built with production-grade security and a real SaaS billing lifecycle.

- **Global CSRF Protection**: Every state-changing API route is shielded against Cross-Site Request Forgery via Next.js Edge Middleware.
- **Strict Session Management**: Powered by `next-auth` with encrypted, `HttpOnly` cookies.
- **Lifecycle Billing**: Subscriptions aren't just "charged." We handle upgrades, cancellations (`cancelAtPeriodEnd`), and webhook-driven downgrades seamlessly using Stripe/Razorpay.

---

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI/Styling**: React 18, Tailwind CSS, Framer Motion
- **State & Data**: Zustand, SWR
- **Database & Cache**: MongoDB (Mongoose), Redis (ioredis)
- **Real-time**: Socket.io
- **Authentication**: NextAuth.js

---

## 🚀 Getting Started

Want to run MovieFlix locally? It's easy!

### 1. Clone & Install
```bash
git clone https://github.com/nareshchandu17/movieflix.git
cd movieflix
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root. You'll need API keys for TMDB, Google AI, and a MongoDB connection string.
```env
MONGODB_URI=your-mongodb-uri
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-key
TMDB_API_KEY=your-tmdb-key
GOOGLE_AI_API_KEY=your-gemini-key
```

### 3. Start the Show
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and grab your popcorn! 🍿

---

## 🤝 Contributing

We love contributions! Whether it's fixing a bug, adding a new feature, or improving documentation, your help makes MovieFlix better for everyone. Please check out the [Issues](https://github.com/nareshchandu17/movieflix/issues) tab to get started.

---

<div align="center">
  <b>Built with ❤️ by <a href="https://github.com/nareshchandu17">CHANDU NARESH</a></b>
  <br>
  <i>Full-stack developer passionate about creating premium cinematic streaming experiences.</i>
</div>
