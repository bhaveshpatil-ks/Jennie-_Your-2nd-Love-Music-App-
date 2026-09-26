# Jennie Music Platform — Architectural Site Map & Route Hierarchy

## 1. Overview & SEO Architecture

The **Jennie Music Platform** is structured as an ultra-fast, minimalist luxury single-page application (SPA) backed by serverless routing, smooth Lenis inertia physics, and robust legal compliance under global standards and India's Digital Personal Data Protection (DPDP) Act, 2023.

- **Primary Domain**: `https://jenniemusic.com`
- **Sitemap XML**: `https://jenniemusic.com/sitemap.xml`
- **Robots Reference**: `https://jenniemusic.com/robots.txt`

---

## 2. Visual Sitemap Hierarchy

```
Jennie Music Platform (https://jenniemusic.com)
│
├── 🎵 Main Music Application
│   ├── / (Home)
│   │   ├── Featured Hero Release
│   │   ├── Trending Hits Row
│   │   ├── Curated Genre Stations (Lo-Fi, Synthwave, Deep House, Ambient, Acoustic)
│   │   └── Quick Start Listeners
│   │
│   ├── /search (Search & Discovery)
│   │   ├── Global Omni-Search Bar (Live keystroke debounced)
│   │   ├── Filter Pills: [All, Songs, Artists, Genres]
│   │   ├── Engine Source Selectors: [All, Jamendo, Audius, YouTube]
│   │   ├── Desktop Spotify Split Layout (Top Match Card + Line-by-Line Songs)
│   │   ├── Mobile Continuous Line-by-Line Track Table
│   │   └── Browse Genre Tiles & Popular Hashtags
│   │
│   ├── /library (Your Library)
│   │   ├── Custom Playlists Grid
│   │   ├── "Create Playlist" Modal with DPDP-compliant form consent
│   │   ├── Liked Songs Shortcut Tile
│   │   └── MongoDB Cloud Sync
│   │
│   ├── /favorites (Liked Songs)
│   │   ├── Dynamic Favorites Header with Total Duration & Count
│   │   ├── Batch Playback Queue Initiator
│   │   └── Line-by-Line Track Management
│   │
│   └── /playlist/:id (Playlist & Genre Detail View)
│       ├── Hero Header with Dynamic Background Glow
│       ├── Track Table with Reordering, Play/Pause, and Like Buttons
│       └── Cohesive Radio Generator
│
├── 🎛️ Global Persistent Audio Engine
│   ├── Floating Desktop Player Bar
│   │   ├── Track Artwork, Title, Artist, & YouTube Official Badge
│   │   ├── Scrubbable Progress Bar with Current / Total Time
│   │   ├── Media Controls (Shuffle, Previous, Play/Pause, Next, Repeat Modes)
│   │   ├── 100% Full Fidelity Volume Slider with Numerical Readout
│   │   └── Video Mode Toggle & Fullscreen Modal Launcher
│   │
│   ├── Floating Mobile Spotify Mini-Player (< 768px)
│   │   ├── Compact Floating Pill above Mobile Bottom Navigation
│   │   ├── Tappable Expand to Fullscreen Player
│   │   └── Instant Play/Pause and Like Actions
│   │
│   ├── Fullscreen Now-Playing Experience
│   │   ├── Ambient Artwork Dynamic Glow
│   │   ├── Large High-Fidelity Artwork Showcase
│   │   ├── Studio Master Sound (1080p HD Bitrate) Indicator
│   │   └── Full Media & Volume Controls
│   │
│   └── Hidden HD YouTube Stream Host
│       ├── 1280x720 High-Definition Canvas (Un-throttled 256kbps Opus audio)
│       └── Automatic Video Player Pip/Expander
│
└── ⚖️ Legal & Regulatory Compliance
    ├── /privacy-policy (Privacy Policy)
    │   ├── India DPDP Act 2023 & GDPR Compliance Framework
    │   ├── Data Fiduciary & Grievance Officer Contact Details
    │   └── User Rights (Access, Correction, Erasure, Withdrawal)
    │
    ├── /terms-and-conditions (Terms of Service)
    │   ├── Fair Use, Royalty-Free & Embed Licensing Clarifications
    │   ├── Prohibited Behaviors & Account Guidelines
    │   └── Jurisdiction & Dispute Resolution (New Delhi, India)
    │
    ├── /cookie-policy (Cookie Policy & Consent Center)
    │   ├── Granular Category Disclosures (Necessary, Analytics, Preferences)
    │   ├── Interactive Cookie Consent Manager
    │   └── Zero Non-Essential Tracking without Affirmative Action
    │
    ├── /refund-policy (Refund & Cancellation Terms)
    │   ├── Free Tier Clarity & In-App Service Policies
    │   └── Support Response Window (48-72 hours)
    │
    └── /business-details (Corporate Transparency)
        ├── Operating Entity Name, Registration & Registered Office
        ├── Direct Grievance Redressal Officer Contact
        └── Verified Business Hours
```

---

## 3. Route Index & Metadata Specification

| Path | Component | Title | Change Frequency | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `Home.jsx` | Jennie — Minimal Luxury Music Streaming | Daily | `1.0` |
| `/search` | `Search.jsx` | Search Royalty-Free Music & Official Masters | Daily | `0.9` |
| `/library` | `Library.jsx` | Your Music Library & Custom Playlists | Weekly | `0.8` |
| `/favorites` | `Favorites.jsx` | Liked Songs & Curated Collections | Weekly | `0.7` |
| `/playlist/:id` | `PlaylistDetail.jsx` | Playlist & Genre Stream Details | Weekly | `0.7` |
| `/privacy-policy` | `PrivacyPolicy.jsx` | Privacy Policy (DPDP Act & GDPR Compliant) | Monthly | `0.5` |
| `/terms-and-conditions`| `TermsAndConditions.jsx`| Terms & Conditions of Service | Monthly | `0.5` |
| `/cookie-policy` | `CookiePolicy.jsx` | Cookie Policy & Consent Center | Monthly | `0.5` |
| `/refund-policy` | `RefundPolicy.jsx` | Refund & Cancellation Policy | Monthly | `0.5` |
| `/business-details` | `BusinessDetails.jsx` | Verified Business & Legal Entity Details | Monthly | `0.5` |

---

## 4. Crawl & Indexing Rules (`robots.txt`)

```robots
User-agent: *
Allow: /

Sitemap: https://jenniemusic.com/sitemap.xml
```
