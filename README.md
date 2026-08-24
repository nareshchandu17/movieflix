# 🎬 MovieFlix
[![Cypress E2E Tests](https://github.com/nareshchandu17/movieflix/actions/workflows/cypress.yml/badge.svg)](https://github.com/nareshchandu17/movieflix/actions/workflows/cypress.yml) [![Lint & Type Check](https://github.com/nareshchandu17/movieflix/actions/workflows/ci.yml/badge.svg)](https://github.com/nareshchandu17/movieflix/actions/workflows/ci.yml)

> **Your Premium Netflix-Style Streaming Experience** - A modern OTT platform with AI-powered insights and cinematic browsing


---

## 🌟 Project Overview

**MovieFlix** is a cutting-edge OTT streaming web application that delivers a Netflix-style cinematic experience. Built with modern web technologies, it features dynamic trailers, AI-powered movie insights, personalized recommendations, and premium UI interactions that redefine how users discover and enjoy content.

---

## ✨ Key Features

### 🎥 **Content Discovery**
- **Dynamic Trailers** - Auto-playing hero trailers with smooth transitions
- **Smart Search** - Real-time search across movies, series, and actors
- **Category Browsing** - Genre-based navigation (Action, Comedy, Drama, Horror, etc.)
- **Trending Content** - "New & Popular" and "Top Web Series" sections

### 🤖 **AI-Powered Insights**
- **Google AI Integration** - Intelligent movie recommendations and summaries
- **Mood Engine** - Content suggestions based on your current mood
- **Smart Insights** - AI-powered content summaries and character analysis
- **Character Analysis** - Deep dive into character profiles and actor filmography

### 👥 **Social Features**
- **Watch Parties** - Real-time synchronized viewing with friends
- **Reactions System** - Express your thoughts with emoji reactions
- **User Profiles** - Personalized accounts with watch history
- **My List** - Save content for later viewing
-**reactions**-you are now react to the movie and posted in your profile

### 🎨 **Premium UI/UX**
- **Cinematic Design** - Netflix-inspired dark theme with vibrant accents
- **Smooth Animations** - Framer Motion powered micro-interactions
- **Responsive Layout** - Optimized for desktop, tablet, and mobile
- **Accessibility** - WCAG compliant with keyboard navigation

### 📱 **Multi-Platform Support**
- **Progressive Web App** - Install on any device
- **Offline Mode** - Download content for offline viewing
- **Multi-Device Sync** - Seamless experience across all devices

---

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend Framework** | Next.js | ^16.1.6 |
| **UI Library** | React | ^18.3.1 |
| **Styling** | Tailwind CSS | ^3.4.10 |
| **Animations** | Framer Motion | ^11.18.2 |
| **Icons** | Lucide React | ^0.439.0 |
| **State Management** | Zustand | ^5.0.12 |
| **API Integration** | SWR | ^2.2.5 |
| **Authentication** | NextAuth | ^4.24.13 |
| **Database** | MongoDB + Mongoose | ^9.3.3 |
| **Cache** | Redis (ioredis) | ^5.10.1 |
| **AI Services** | Google AI | ^1.22.0 |
| **Video Player** | React Player | ^2.16.0 |
| **Real-time** | Socket.io | ^4.8.3 |
| **File Storage** | Cloudinary | ^2.9.0 |
| **Payments** | Stripe | (Optional) |

---

## 🏗 Application Architecture

### System Flow
```mermaid
graph TD
    Client[Client (Next.js App Router)]
    
    subgraph Frontend
        UI[React UI Components]
        State[Zustand / SWR]
        UI <--> State
        State <--> Client
    end

    subgraph API Gateway
        NextAPI[Next.js API Routes]
    end

    Client <-->|HTTP/REST| NextAPI

    subgraph Backend Services
        DB[(MongoDB)]
        Cache[(Redis Cache)]
        Socket[Socket.io / Real-time]
    end

    NextAPI <-->|Mongoose| DB
    NextAPI <-->|ioredis| Cache
    NextAPI <-->|WS| Socket

    subgraph External APIs
        TMDB[TMDB API]
        GoogleAI[Google AI]
        Payment[Stripe / Razorpay]
        Cloudinary[Cloudinary]
    end

    NextAPI <--> TMDB
    NextAPI <--> GoogleAI
    NextAPI <--> Payment
    NextAPI <--> Cloudinary
    
    %% Webhook flows
    Payment -.->|Webhooks| NextAPI
```

### Directory Structure
```
movieflix-nextjs/
├── app/                          # Next.js App Router
│   ├── [castName]/              # Actor/Cast pages
│   ├── account/                 # User account management
│   ├── api/                     # API routes
│   ├── movie/                   # Movie details & pages
│   ├── series/                  # Series details & episodes
│   ├── watch-party/             # Social viewing features
│   └── page.tsx                 # Homepage
├── components/                   # React components
│   ├── carousels/              # Content carousels
│   ├── player/                 # Video player components
│   ├── series/                 # Series-specific components
│   ├── navbar/                 # Navigation components
│   └── ui/                     # Reusable UI components
├── contexts/                    # React contexts
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
├── services/                    # External service integrations
├── types/                       # TypeScript type definitions
└── public/                      # Static assets
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Redis** (for caching and sessions)

### 1. Clone the Repository

```bash
git clone https://github.com/nareshchandu17/movieflix.git
cd movieflix
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=your-mongodb-uri

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Keys
TMDB_API_KEY=your-tmdb-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Stripe (Optional - for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Cloudinary (for video uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### Getting API Keys

1. **TMDB API Key**: Sign up at [TMDB](https://www.themoviedb.org/settings/api)
2. **Google AI API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Google OAuth**: Create credentials at [Google Cloud Console](https://console.cloud.google.com/)
4. **Cloudinary**: Sign up at [Cloudinary](https://cloudinary.com/)

---

## 🏃‍♂️ Running the Development Server

```bash
# Start development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run clean` | Clean build artifacts and cache |
| `npm run fresh` | Clean install and start fresh dev server |

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npx vercel
   ```

2. **Configure Environment Variables** in Vercel Dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup for Production

- Ensure all environment variables are set in your hosting platform
- Configure MongoDB Atlas for cloud database
- Set up Redis Cloud for caching
- Configure domain and SSL certificates

---

## 💳 Subscription Lifecycle

MovieFlix implements a robust, production-ready SaaS billing lifecycle ensuring users get exactly what they pay for without immediate cut-offs.

1. **Upgrade / Renewal (`subscription.charged`)**: 
   - When a successful charge occurs, the user's `subscriptionExpiry` is extended (monthly or yearly).
   - Status immediately becomes `active`.
2. **Cancellation (`cancelAtPeriodEnd`)**: 
   - When a user cancels, they are **not** immediately downgraded. 
   - The database flags the subscription to cancel at the end of the current billing cycle (`cancelAtPeriodEnd: true`).
   - The user retains premium access until `currentPeriodEnd`.
3. **Downgrade to Free (`subscription.cancelled`)**: 
   - Only when the billing period completely ends, the payment provider sends a webhook.
   - We catch this webhook to finalize the cancellation, dropping the user back to the free tier limitations.

---

## ⚠️ Known Limitations

While MovieFlix is a robust platform, there are a few intentional constraints in this current version:

- **AI Generation Quotas**: The Google AI integration (for moods and insights) uses a shared API key in the demo. Heavy traffic might lead to rate-limiting or fallback to standard TMDB descriptions.
- **Watch Party Scale**: The current Socket.io implementation uses a single Node.js instance. For true production scale (10,000+ concurrent users), this would need to be migrated to a Redis adapter or a managed service like Pusher.
- **Video Storage Limits**: Uploaded user avatars or custom watch party clips are stored on a free-tier Cloudinary account, which has strict bandwidth and storage limits.

## 🛡 Security Architecture

MovieFlix prioritizes security by implementing best practices across the full stack:

- **Global CSRF Protection**: All state-changing API routes (`POST`, `PUT`, `DELETE`) are protected against Cross-Site Request Forgery via a custom Next.js `middleware.ts`. This middleware intercepts requests at the Edge and validates tokens securely using the Web Crypto API.
- **Strict Session Management**: `next-auth` securely handles session cookies (`HttpOnly`, `Secure` in production) and API routes strictly enforce `getServerSession()` before interacting with the database.
- **Webhook Integrity**: Webhooks from Razorpay bypass standard CSRF checks but require cryptographic signature verification before applying subscription changes.
- **Hardened HTTP Headers**: The global middleware enforces `X-XSS-Protection`, `X-Frame-Options`, and `X-Content-Type-Options` on all responses.

---

## 🤝 Contributing Guidelines

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style Guidelines

- **TypeScript** for all new code
- **Tailwind CSS** for styling
- **ESLint** configuration must pass
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

### Bug Reports

- Use the [Issues](https://github.com/nareshchandu17/movieflix-nextjs/issues) page
- Provide detailed reproduction steps
- Include browser/OS information
- Add screenshots if applicable

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 MovieFlix

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

### Lead Developer
**[CHANDU NARESH](https://github.com/nareshchandu17)** - Full-stack developer passionate about creating premium cinematic streaming experiences.

---

## ⭐ Show Your Support

If you find this project helpful, please consider giving it a ⭐ on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/nareshchandu17/movieflix.svg?style=social&label=Star)](https://github.com/nareshchandu17/movieflix)
[![GitHub forks](https://img.shields.io/github/forks/nareshchandu17/movieflix.svg?style=social&label=Fork)](https://github.com/nareshchandu17/movieflix)
[![GitHub issues](https://img.shields.io/github/issues/nareshchandu17/movieflix.svg)](https://github.com/nareshchandu17/movieflix/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

**Made with ❤️ by CHANDU NARESH**
