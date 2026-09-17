# 🎵 Jennie Music Backend API

Secure Node.js & Express REST API for the Jennie Music Streaming platform with MongoDB Atlas persistence, YouTube search, and Jamendo / Audius stream integration.

---

## 🚀 Features

- **Multi-Source Streaming & Search**:
  - **YouTube Music**: Real-time search with clean title parsing and video IDs for official embed streaming.
  - **Jamendo API**: Royalty-free independent tracks with 320kbps streams.
  - **Audius Protocol**: Decentralized open music streaming.
- **MongoDB Cloud Persistence (Mongoose)**:
  - Custom user playlists (`/api/playlists`).
  - Liked tracks & favorites (`/api/favorites`).
- **Resilient Caching**: In-memory caching with `node-cache` (TTL 5-10 min) to reduce API latency and avoid rate limits.
- **Fail-Safe Offline Mode**: Automatic graceful fallback to local data if the database or external network is temporarily unreachable.

---

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

Set the following variables in `.env`:
```env
PORT=5000
JAMENDO_CLIENT_ID=your_jamendo_client_id
JAMENDO_API_URL=https://api.jamendo.com/v3.0
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jennie_music?retryWrites=true&w=majority
```

### 3. Run Development Server
```bash
npm run dev
```

Server will start on: `http://localhost:5000`

---

## 📡 API Endpoints

### Tracks (`/api/tracks`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tracks/trending` | Fetch trending global tracks across YouTube & Jamendo |
| `GET` | `/api/tracks/featured` | Fetch spotlight featured track |
| `GET` | `/api/tracks/search?q=:query&source=all` | Search tracks across YouTube, Audius, or Jamendo |
| `GET` | `/api/tracks/genre/:genre` | Fetch tracks filtered by genre |
| `GET` | `/api/tracks/home-feed` | Aggregated feed for the home screen |
| `GET` | `/api/tracks/:id` | Fetch details of a specific track |

### Playlists (`/api/playlists`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/playlists` | Get all playlists |
| `POST` | `/api/playlists` | Create a new custom playlist |
| `GET` | `/api/playlists/:id` | Get single playlist by ID |
| `PUT` | `/api/playlists/:id` | Update a playlist (add/remove tracks) |
| `DELETE` | `/api/playlists/:id` | Delete a playlist |

### Favorites (`/api/favorites`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/favorites` | Get all liked tracks |
| `POST` | `/api/favorites/toggle` | Add or remove a track from favorites |
| `DELETE` | `/api/favorites/:id` | Remove a track by ID |

---

## 🔒 Security
- All database credentials and external API tokens are stored strictly on the backend via environment variables.
- Direct database connection strings and secret keys are protected by `.gitignore` and never exposed to the client.
