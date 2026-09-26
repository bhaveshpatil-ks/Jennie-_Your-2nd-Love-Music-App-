# 🎵 Jennie Music Platform

> An elite, high-fidelity music streaming platform designed with a **minimal luxury** aesthetic for discerning listeners, creators, and audiophiles.

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Lenis](https://img.shields.io/badge/Lenis-Smooth_Scroll-black)](https://github.com/darkroomengineering/lenis)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📑 Core Documentation Index

- 📘 **[Product Requirement Document (PRD)](./docs/PRD.md)**: Exhaustive product specification, mathematical recommendation algorithms, unity-gain audio architecture, and regulatory compliance frameworks.
- 🗺️ **[Architectural Site Map & Component Hierarchy](./docs/SITEMAP.md)**: Visual sitemap, SEO routing index, component layout tree, and accessibility standards.
- 🌐 **[Production XML Sitemap](./frontend/public/sitemap.xml)** (also mirrored in [`./docs/sitemap.xml`](./docs/sitemap.xml)): Canonical search engine crawler map compliant with Sitemaps.org 0.9.

---

## 🏛️ Project Directory Structure

```
personal-music/
├── 📁 backend/                        # Node.js / Express API Proxy & Scraper
│   ├── 📁 src/
│   │   ├── 📁 config/                 # Database configuration (MongoDB Atlas)
│   │   ├── 📁 models/                 # Mongoose schemas (Playlists, Favorites)
│   │   ├── 📁 routes/                 # Express API endpoints (/tracks, /playlists, /favorites)
│   │   ├── 📁 services/               # External ingestion (Jamendo, Audius, YouTube Topic)
│   │   └── 📁 utils/                  # String cleaners & waveform visualizer helpers
│   ├── .env.example                   # Environment variable template
│   ├── package.json                   # Backend dependencies
│   └── README.md                      # Backend service documentation
│
├── 📁 frontend/                       # React 18 Single Page Application
│   ├── 📁 public/                     # Static assets & SEO crawlers
│   │   ├── robots.txt                 # Search engine crawler directives
│   │   ├── sitemap.xml                # Canonical production sitemap
│   │   └── _redirects                 # SPA routing redirects for deployment
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 common/             # CookieConsentBanner, LikeButton, CreatePlaylistModal, etc.
│   │   │   ├── 📁 layout/             # AppLayout, TopHeader, Sidebar, MobileNav, Footer
│   │   │   ├── 📁 player/             # PlayerBar, ProgressBar, VolumeControl, FullscreenPlayer, HD YouTubeEmbed
│   │   │   └── 📁 tracks/             # Spotify-style TrackTable, TrackListRow, TrackCard
│   │   ├── 📁 data/                   # High-fidelity mock seed data with audio features
│   │   ├── 📁 pages/                  # Home, Search, Library, Favorites, PlaylistDetail
│   │   │   └── 📁 legal/              # PrivacyPolicy, TermsAndConditions, CookiePolicy, RefundPolicy, BusinessDetails
│   │   ├── 📁 services/               # Axios API client & 5-tier recommendationEngine
│   │   ├── 📁 store/                  # Zustand stores (usePlayerStore, useLibraryStore)
│   │   └── 📁 utils/                  # Duration & view count formatters
│   ├── index.html                     # HTML5 entrypoint with preconnect hints
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.js             # Minimal luxury obsidian color palette & animations
│   └── vite.config.js                 # Vite bundler configuration
│
├── 📁 docs/                           # Official Platform Documentation
│   ├── PRD.md                         # Complete Product Requirement Document
│   ├── SITEMAP.md                     # Architectural visual sitemap & routing breakdown
│   └── sitemap.xml                    # Reference XML sitemap
│
├── .gitignore                         # Universal multi-workspace Git ignore file
└── README.md                          # Master workspace overview & quick-start guide
```

---

## ✨ Key Platform Features

### 1. Minimal Luxury Design & Lenis Inertia Physics
- **Obsidian Palette**: Deep background shades (`#08080A`, `#101014`, `#18181D`) paired with muted silver typography (`#F4F4F6`, `#8A8A93`) and subtle gold accenting (`#D4AF37`).
- **Inertial Momentum**: Powered by `@studio-freight/lenis` providing fluid, zero-lag scroll physics matching high-end design showcases.
- **Responsive Layout**: Adapts gracefully from desktop ultra-wide monitors down to single-hand mobile devices with a Spotify-style floating mini-player pill.

### 2. Studio Master Sound Fidelity
- **100% Unity Gain**: Default volume locked to `1.0` (0 dBFS reference) with zero software attenuation.
- **Anti-Throttling HD Canvas**: YouTube background playback executes inside a `1280px × 720px` off-screen frame, forcing YouTube CDNs to deliver studio-quality 160–256 kbps Opus/AAC audio streams rather than downgraded 48 kbps low-res audio.
- **Topic Channel Prioritization**: Search engines prioritize official studio master tracks (`- Topic` releases and verified label uploads) while de-ranking noisy fan concert recordings and bootlegs.

### 3. Smart Recommendation Engine (Zero Diversity Collapse)
- **Mathematical 5-Tier Scoring**:
  $$\text{FinalScore} = 35\%(\text{Genre}) + 25\%(\text{Mood/Audio Vector}) + 20\%(\text{Collab}) + 15\%(\text{Artist}) + 5\%(\text{Freshness})$$
- **Anti-Repetition Cooldowns**: Rolling 6-song window prevents artist monopolies and title keyword looping.
- **Controlled Discovery**: Every 4th or 5th queue recommendation automatically injects an adjacent genre exploration track.

### 4. Enterprise Legal & Regulatory Compliance
- **India DPDP Act 2023 & GDPR Ready**: Granular affirmative cookie consent mechanism, right-to-forget data erasure, explicit form consent, and registered Data Fiduciary disclosure.
- **Dedicated Legal Suite**: Dedicated `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy`, `/refund-policy`, and `/business-details` routes.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher
- *(Optional)* [MongoDB Atlas](https://www.mongodb.com/atlas) connection string for cloud playlist persistence

### 1. Backend Service Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env to set your PORT and MONGODB_URI (defaults to localhost / mock mode if unconfigured)

# Start backend development server
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Application Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite hot-reloading development server
npm run dev
# Application opens at http://localhost:5173
```

### 3. Production Build
```bash
# Build optimized frontend bundle
cd frontend
npm run build

# Output is generated cleanly in frontend/dist/
```

---

## 🔒 Security & Privacy Notice
Jennie Music does not store unconsented tracking cookies or share listening telemetry with third-party advertisers. All client-side playback telemetry respects user preference toggles configurable through the in-app Cookie Consent Center.

---

*Designed & engineered with perfection for Jennie Music Platform.*
