# Product Requirement Document (PRD) — Jennie Music Platform

**Document Version**: 2.4.0  
**Status**: Approved & Production Ready  
**Target Audience**: Engineering, Product Design, Operations & Legal Compliance  
**Last Updated**: September 25, 2026  

---

## 1. Executive Summary & Product Vision

**Jennie Music** is an elite, high-fidelity music streaming platform designed around a **"minimal luxury"** aesthetic for discerning listeners, creators, and professionals. 

Unlike mainstream platforms cluttered with loud advertisements, visual noise, and algorithmic lock-in, Jennie delivers:
1. **Uninterrupted Audio Quality**: Full 100% unity-gain digital audio streaming across royalty-free master tracks (Jamendo CC-BY, Audius) and official studio releases (YouTube Music Studio Masters).
2. **Intelligent Cohesion without Diversity Collapse**: An adaptive recommendation engine with mathematical anti-repetition rules, artist cooldown windows, and controlled variety.
3. **Billionaire Minimalist Aesthetic**: Deep obsidian color palette, subtle luminescence borders, silky Lenis inertial scrolling, and fluid micro-interactions.
4. **Uncompromising Regulatory Compliance**: Fully compliant with India’s Digital Personal Data Protection (DPDP) Act 2023, GDPR, and global ePrivacy mandates.

---

## 2. Product Objectives & Target Metrics

| Goal | Target Metric | Engineering Implementation |
| :--- | :--- | :--- |
| **Instant Playback** | Time-to-First-Audio < 600ms | HTML5 Audio preloading + pre-warmed YouTube HD player instance |
| **Pristine Audio Fidelity** | 160–256 kbps Opus/AAC Audio | 1280x720 HD offscreen canvas preventing adaptive bitrate throttling |
| **Zero Diversity Collapse** | $\ge 3$ distinct artists per 10-song queue | Hard 6-song rolling window cooldowns + 4th/5th slot diversity injection |
| **Silk-Smooth Scrolling** | Consistent 60/120 FPS | Lenis smooth scrolling with cubic deceleration physics |
| **Legal Compliance** | 100% DPDP 2023 & GDPR Audit Score | Affirmative cookie consent, data fiduciary disclosure, grievance officer |

---

## 3. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Jennie Client App                        │
│          (React 18 + Vite 6 + Tailwind CSS + Zustand)       │
├──────────────────────────────┬──────────────────────────────┤
│         UI & Motion          │      Audio Engine Core       │
│  - Lenis Smooth Scrolling    │  - HTML5 Audio (Jamendo)     │
│  - Minimal Luxury Components │  - 1080p HD YouTube Player   │
│  - Spotify-Style Line Layout │  - Web Audio Unity Gain 1.0  │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│    Recommendation Engine     ││      Backend API Proxy      │
│  - 5-Tier Weighted Scoring   ││   (Node.js / Express 4.x)   │
│  - Anti-Repetition Filters   │├─────────────────────────────┤
│  - Cluster Cooldowns         ││ - MongoDB Atlas Database    │
│  - Multiplicative Decay      ││ - Jamendo & Audius APIs     │
└──────────────────────────────┘│ - YouTube Official Scraper  │
                                └─────────────────────────────┘
```

### Technology Matrix
- **Frontend Core**: React 18, Vite 6, Tailwind CSS 3, Zustand 4 (lightweight reactive state).
- **Smooth Inertia Engine**: `@studio-freight/lenis` (configured for luxury momentum).
- **Icons & Visual Language**: `lucide-react`.
- **Backend Service**: Node.js 20+, Express.js 4.x.
- **Database Layer**: MongoDB Atlas via Mongoose 8.x.
- **External Audio Ingestion**: Jamendo API v3.0, Audius REST API, YouTube Iframe API.

### 3.1. API Security & Same-Origin Cloaking Architecture
- **Zero Third-Party Secrets in Client Bundle**: Jamendo client IDs, MongoDB connection strings, and scrapers live exclusively on the backend (`backend/.env`), never in frontend JavaScript.
- **Same-Origin Reverse-Proxy Cloaking**: The frontend communicates exclusively via relative `/api` paths. The actual hosting origin (e.g. Railway URL) is shielded by edge CDN rewrites (Netlify / Vercel / Nginx) and local Vite dev proxy (`localhost:5173/api` $\to$ `localhost:5000/api`).
- **Defensive Request Hardening**: Outgoing requests enforce `X-Requested-With: XMLHttpRequest` and `X-Jennie-Client: web-app`. Backend applies `helmet`, rate-limiting (300 req / 15 min), and masks server technology fingerprints (`x-powered-by` disabled).
- **Console Log Sanitization**: Network failure diagnostics and endpoint URI paths are suppressed in production builds to prevent diagnostic reconnaissance by unauthorized actors.

---

## 4. Audio Architecture & Volume Quality Engine

### 4.1. The 100% Full Unity Gain Standard
- Default application volume is locked at **`1.0` (100% / 0 dBFS reference level)** across the player store.
- Eliminates the previous 20% attenuation penalty (`0.8`), ensuring immediate competitive loudness parity with Spotify and Apple Music.

### 4.2. High-Definition Canvas (Anti-Throttling)
- Standard YouTube embedded players in background/audio mode typically collapse to small dimensions (e.g. 320x240), causing YouTube’s Adaptive Bitrate (ABR) algorithm to downgrade to 240p/360p with low-bitrate compressed audio (48–64 kbps).
- Jennie enforces a **1280px × 720px High-Definition canvas** (`fixed -left-[99999px] -top-[99999px] w-[1280px] h-[720px]`).
- YouTube's CDN detects an HD stream and serves high-bitrate Opus (160–256 kbps) audio with crystal-clear high-frequency response (10 kHz – 20 kHz) and punchy bass.

### 4.3. Studio Master Prioritization in Search
- Backend search queries dynamically append `official audio` or `official release`.
- Videos from verified record labels and official YouTube Music `- Topic` channels are prioritized (+10 rank bonus).
- Fan bootlegs, noisy live concert videos, parody tracks, and reaction recordings are actively de-ranked (-20 penalty).

---

## 5. Algorithmic Recommendation Engine (PRD-REC-01)

### 5.1. Mathematical Scoring Formula (Total: 100%)

$$\text{FinalScore} = \text{Genre}(35\%) + \text{Mood}(25\%) + \text{Collab}(20\%) + \text{Artist}(15\%) + \text{Freshness}(5\%)$$

1. **Genre & Sub-Genre Match (35%)**:
   - `0.35`: Exact sub-genre match (e.g., Chillhop to Chillhop, Punjabi Rap to Punjabi Rap).
   - `0.30`: Parent genre match (e.g., Hip-Hop, Lo-Fi, Deep House).
   - `0.20`: Adjacent genre via `GENRE_AFFINITY` graph (smooth mood transition).
2. **Mood & Audio Feature Vector Similarity (25%)**:
   - Normalized Euclidean distance across 5-dimensional audio vector:
     $$\text{Dist} = \sqrt{1.5 \Delta E^2 + \Delta V^2 + 0.8 \Delta D^2 + \Delta A^2 + 0.5 (\Delta \text{BPM}/100)^2}$$
   - Energy jumps $> 0.45$ are hard-filtered to prevent jarring mood swings.
3. **Collaborative Filtering (20%)**:
   - Direct co-play connection ("users who played track A also played track B"): `0.20`.
   - User favorites / affinity profile match: `0.12`.
4. **Same Artist / Album (15% Max, Subject to Multiplicative Decay)**:
   - Base: Same album (`0.15`), Same artist (`0.10`).
   - Multiplicative Session Decay:
     $$\text{DecayedArtistScore} = \text{BaseScore} \times (0.5)^N$$
     *(where $N$ is the number of times this artist has played in the current session)*.
5. **Freshness & Discovery Injection (5%)**:
   - Awarded to artists not heard in the recent session window.

### 5.2. Hard Anti-Repetition Rules (Post-Scoring Filters)

1. **Same-Artist Cooldown**:
   - Rolling window of the last 6 songs is tracked continuously.
   - If an artist has already appeared **2 times in the last 6 songs**, they are **strictly excluded** until the cooldown window passes.
2. **Same-Song-Cluster Cooldown**:
   - Series songs (e.g., "52 Bars", "100 Bars", Volume 1, Pt. 2) are classified under a single cluster ID (`cluster:artist:series`).
   - A cluster is limited to maximum 2 appearances per 6-song rolling window.
3. **Diversity Injection (4th & 5th Slots)**:
   - Every 4th and 5th song in the upcoming queue **must come from a different artist than the seed song**, selected purely on genre/mood alignment.
4. **Infinite Category Lock-Breaker**:
   - If 8 consecutive songs belong to the exact same sub-tag or artist, candidate selection forces diversification into the wider parent genre pool.
5. **Validation Check**:
   - Every 10-song queue is verified to contain $\ge 3$ distinct artists before return.

---

## 6. User Interface & Experience Specifications

### 6.1. Mobile Spotify-Style Layout
- **Continuous Line-by-Line Track Rows**:
  - Eliminated bulky 2-column square cards in search results.
  - Search results present a compact Top Match followed by an uninterrupted vertical track list (`TrackTable` / `TrackListRow`):
    - Left: Album cover thumbnail (36px × 36px).
    - Middle: Track title (white, bold), artist name, and license badge.
    - Right: Heart (like) button, duration, and 3-dot playlist menu.
- **Floating Mini-Player Bar**:
  - Sits at `bottom-[64px]` directly above the mobile bottom navigation.
  - Tapping opens the full-screen now-playing drawer.
  - Integrated play/pause, like, and video mode toggles.

### 6.2. Desktop Minimal Luxury Layout
- **Top Match + Top Songs Split**:
  - Left column: Top Match curated card with high-res artwork, title, artist, genre, and floating white circular play button.
  - Right column: Top 4 songs in clean line-by-line format.
  - Below: "More Songs" continuing line-by-line with consistent index numbering (#5, #6, ...).

### 6.3. Smooth Inertial Physics (Lenis)
- `duration: 1.35s` with exponential deceleration (`1.001 - 2^(-10t)`).
- Natural touch and wheel response without browser default stutter.

---

## 7. Legal, Regulatory & Privacy Compliance

### 7.1. India Digital Personal Data Protection (DPDP) Act, 2023
- **Data Fiduciary Details**: Clear operational disclosure of operating entity, registered office, and contact address.
- **Grievance Redressal Officer**: Designee name, email (`grievance@jenniemusic.com`), response turnaround ($\le 48$ hours).
- **Purpose Limitation**: Audio caching and favorites are stored locally or synced under explicit user command.
- **User Rights**: Absolute user rights to access, rectify, erase, or withdraw data consent at any time.

### 7.2. Cookie & Tracking Compliance
- **Granular Categories**: Strictly Necessary, Analytics, Preference cookies.
- **Opt-in Requirement**: Zero non-essential cookies loaded prior to affirmative user consent.
- **Persistent Consent Manager**: Accessible anytime via `/cookie-policy` or footer links.

### 7.3. Intellectual Property & Fair Embed Licensing
- **Royalty-Free Audio**: Creative Commons (CC-BY, CC-BY-SA, CC0) and Jamendo Developer Licenses.
- **YouTube Embeds**: Compliant with YouTube API Terms of Service (Section III.A); embedded via official iframe without video stripping or downloading.

---

## 8. Directory & File Organization

```
personal music/
├── .gitignore                      # Universal git ignore (secrets, dist, node_modules)
├── README.md                       # Master project overview & setup guide
├── docs/                           # Centralized documentation directory
│   ├── PRD.md                      # This comprehensive Product Requirement Document
│   ├── SITEMAP.md                  # Human-readable architectural site map
│   └── sitemap.xml                 # Search engine XML sitemap
│
├── backend/                        # Node.js / Express API Service
│   ├── package.json
│   ├── README.md
│   ├── .env.example
│   └── src/
│       ├── server.js               # Express application entrypoint
│       ├── config/db.js            # MongoDB connection manager
│       ├── models/                 # Mongoose schemas (Playlist, Favorite)
│       ├── routes/                 # Express route handlers (tracks, playlists, favorites)
│       ├── services/               # API clients (jamendo.js, audius.js, youtube.js)
│       └── utils/                  # Cleaners & waveform generators
│
└── frontend/                       # React 18 Single-Page Application
    ├── index.html                  # HTML5 shell with accessibility meta
    ├── package.json
    ├── vite.config.js              # Vite 6 bundler config
    ├── tailwind.config.js          # Custom luxury color & animation system
    ├── public/
    │   ├── _redirects              # Netlify/SPA route redirects
    │   ├── robots.txt              # Crawler permissions
    │   └── sitemap.xml             # Public production sitemap
    └── src/
        ├── App.jsx                 # Top-level shell
        ├── main.jsx                # Application root mounting
        ├── index.css               # Global Tailwind & Lenis smooth scroll directives
        ├── components/
        │   ├── common/             # Modals, LikeButton, CookieConsentBanner
        │   ├── layout/             # AppLayout, TopHeader, Sidebar, MobileNav, Footer
        │   ├── player/             # PlayerBar, FullscreenPlayer, VolumeControl, YouTubePlayerEmbed
        │   └── tracks/             # TrackTable, TrackListRow, TrackCard
        ├── data/                   # Mock tracks catalog & genre definitions
        ├── pages/                  # Home, Search, Library, Favorites, PlaylistDetail
        │   └── legal/              # PrivacyPolicy, TermsAndConditions, CookiePolicy, RefundPolicy, BusinessDetails
        ├── services/               # api.js & recommendationEngine.js
        ├── store/                  # usePlayerStore.js & useLibraryStore.js
        └── utils/                  # formatters.js
```
