# 🎵 Jennie Music — Web Client

> A sleek, minimal luxury music streaming web app with buttery-smooth scrolling, full-fidelity studio audio, and a smart recommendation engine that keeps your listening queue fresh.

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Lenis](https://img.shields.io/badge/Lenis-Momentum_Scroll-000000)](https://github.com/darkroomengineering/lenis)
[![Audio](https://img.shields.io/badge/Audio-100%25_Unity_Gain-gold)](https://jenniemusic.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features & User Experience

- **💎 Minimal Luxury Aesthetic**: Designed with an obsidian visual hierarchy (`#080808`, `#121216`), delicate glowing borders, custom gold luminescence, and refined serif accent typography.
- **🌊 Silky Lenis Momentum Physics**: Smooth inertial scrolling with customized exponential deceleration for a buttery browsing sensation.
- **🎧 Studio Master Sound Fidelity**:
  - Full scale 100% unity-gain digital audio streaming.
  - HD canvas anti-throttling architecture ensuring YouTube CDN serves high-bitrate (160–256 kbps Opus/AAC) studio masters.
- **🎵 Spotify-Grade Line Layout**: High-density track rows with album artwork, artists, duration badges, and instant play controls.
- **🌐 Real-Time Offline Detection**: Unobtrusive luxury floating banner detects network outages and resumes caching gracefully without interrupting offline playback.
- **🌌 Custom 404 Experience**: Dedicated luxury 404 page with animated vinyl acoustics and one-click navigation back to your catalog.
- **⚖️ Privacy & Regulatory Compliance**: Fully compliant with India's DPDP Act 2023, GDPR, and ePrivacy directives with affirmative cookie consent management.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Defaults to relative `/api` reverse proxy, shielding backend hosts from public inspection).*

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build
```bash
npm run build
```

---

## 🏛️ Architecture & Component Hierarchy

```
frontend/src/
├── components/
│   ├── common/        # OfflineAlert, CookieConsentBanner, LikeButton, GenreTile
│   ├── layout/        # AppLayout, TopHeader, Sidebar, MobileNav, Footer
│   ├── player/        # PlayerBar, ProgressBar, VolumeControl, FullscreenPlayer, HD YouTubeEmbed
│   └── tracks/        # Spotify-style TrackTable, TrackListRow, TrackCard
├── data/              # High-fidelity mock seed catalog
├── pages/             # Home, Search, Library, Favorites, PlaylistDetail, NotFound
│   └── legal/         # PrivacyPolicy, TermsAndConditions, CookiePolicy, RefundPolicy, BusinessDetails
├── services/          # Safe API client with same-origin cloaking & recommendation engine
├── store/             # Zustand stores (usePlayerStore, useLibraryStore)
└── utils/             # Time formatters and helpers
```

---

*Engineered with precision for the Jennie Music Platform.*
