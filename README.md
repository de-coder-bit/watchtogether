# 🎬 WatchTogether

> **Synchronized Video Streaming & Real-Time Watch Party Web Platform**  
> Stream your personal media library in frame-accurate sync with your partner, adaptive HLS multi-bitrate transcoding, and live chat — built entirely on **100% free-tier services**.

---

## 🌟 Key Features

- 👯 **Partner Pairing & Presence**: Link accounts using 6-digit invite codes (`WT-XXXXXX`) or shareable invite URLs. Real-time partner presence and typing indicators.
- ⚡ **Real-Time Playback Synchronization**: Frame-accurate Play, Pause, Seek, and Heartbeat sync over WebSocket (STOMP over SockJS) with automatic drift correction (<0.5s).
- 🎞️ **FFmpeg HLS Transcoding Pipeline**: Asynchronous background worker generates adaptive multi-bitrate HLS streams (`360p`, `480p`, `720p`) + `master.m3u8` playlists and auto-captures video thumbnails.
- 💬 **Cinema Watch Party & Live Chat**: Side chat panel with room history persistence in PostgreSQL, interactive emoji reactions, and real-time partner typing status.
- 📦 **Chunked Multipart Upload**: Upload large personal media files with real-time chunk progress and automated background transcoding.
- 🍿 **Streaming Catalog UI**: Dark cinema UI featuring hero premiere banners, category filters, search, and a *Continue Watching* carousel tracking per-user resume timestamps.
- ☁️ **Zero-Cost Free Tier Architecture**: Designed to run seamlessly on Cloudflare R2 (free egress), Neon / Supabase (Free PostgreSQL), Render / Railway (Docker backend), and Vercel (React frontend).

---

## 🏗️ Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                  WatchTogether                                    |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Frontend (React 18 + TypeScript + Vite + Tailwind CSS + HLS.js)                  |
|  * Adaptive HLS Video Player (Quality levels, auto-bandwidth, custom HUD controls)|
|  * Watch Party Cinema View (STOMP Sync + Live Chat + Presence)                    |
|  * Partner Connection Hub (Invite code generator, paired status)                 |
|                                     |                                             |
|                     REST (JWT) / WebSocket (STOMP)                                |
|                                     v                                             |
|  Backend (Spring Boot 3.3 + Java 17 + Spring Security + JPA)                      |
|  * Auth & Partner Pairing Engine (BCrypt, Stateless JWT)                          |
|  * Storage Engine (AWS S3 SDK v2 -> Cloudflare R2 / Backblaze B2 / MinIO / Local) |
|  * Background Video Worker (@Async + VideoJob Queue)                              |
|  * FFmpeg Transcoder (Multi-bitrate HLS: 360p, 480p, 720p + poster thumbnail)     |
|  * STOMP Message Broker (Playback action broadcasts + Chat history)               |
|                                     |                                             |
|        +----------------------------+----------------------------+                |
|        |                                                         |                |
|        v                                                         v                |
|  Database (PostgreSQL / Neon / Supabase)              Object Storage (R2 / MinIO) |
|  * Users & Partner links                              * Raw video uploads         |
|  * Videos & HLS manifests                             * Master & variant .m3u8    |
|  * Video processing jobs                              * .ts video chunks          |
|  * Watch rooms & Chat messages                        * Poster thumbnails         |
|  * User watch progress / history                                                  |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start (Local Development)

### Option 1: One-Command Docker Compose (Full Stack + PostgreSQL + MinIO)

Ensure Docker Desktop is running, then run:

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost:5173`
- **Backend REST / WebSocket**: `http://localhost:8080`
- **MinIO S3 Storage Console**: `http://localhost:9001` (Username: `minioadmin`, Password: `minioadmin`)

---

### Option 2: Native Run (Backend + Frontend)

#### Prerequisites
- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+ & npm**
- **FFmpeg** (optional for local testing; automatic fallback included if not found):
  - *Windows*: `winget install Gyan.FFmpeg` or `choco install ffmpeg`
  - *macOS*: `brew install ffmpeg`
  - *Ubuntu/Debian*: `sudo apt install -y ffmpeg`

#### 1. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

*Note: By default, the backend runs on port `8080` using in-memory H2 / local file storage for zero-config startup.*

#### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 👥 Testing Paired Streaming (Pre-Seeded Demo Accounts)

Two demo accounts already linked as partners are pre-seeded upon launch:

| User | Email | Password | Role |
|---|---|---|---|
| **Alex** | `alex@watchtogether.app` | `password123` | Paired Partner A |
| **Sam** | `sam@watchtogether.app` | `password123` | Paired Partner B |

### How to test synchronized playback:
1. Open an Incognito / regular browser window and sign in as **Alex** (use the 1-click demo login button).
2. Open a second browser window and sign in as **Sam**.
3. In Alex's window, click **"Watch Party with Partner"** on any video.
4. Copy the room link (e.g. `http://localhost:5173/room/ROOM-XXXXXX`) and open it in Sam's window.
5. Press **Play**, **Pause**, or **Seek** on either window: both players mirror the action with sub-second latency!
6. Type messages in the side chat panel to test live real-time chat and partner typing indicators.

---

## ☁️ Free-Tier Cloud Deployment Guide

### 1. Database (Free PostgreSQL)
- **Neon.tech** or **Supabase**:
  1. Create a free project and copy your connection string (`jdbc:postgresql://<host>:5432/<database>`).
  2. Set environment variables:
     ```env
     SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<database>?sslmode=require
     SPRING_DATASOURCE_USERNAME=<db_user>
     SPRING_DATASOURCE_PASSWORD=<db_password>
     ```

### 2. Object Storage (Cloudflare R2 - S3 Compatible with Free Egress)
1. Go to Cloudflare Dashboard → **R2 Object Storage** → Create Bucket `watchtogether`.
2. Manage R2 API Tokens → Create Token with **Admin Read & Write** permissions.
3. Configure backend environment:
   ```env
   STORAGE_PROVIDER=s3
   S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_BUCKET_NAME=watchtogether
   S3_ACCESS_KEY=<r2_access_key_id>
   S3_SECRET_KEY=<r2_secret_access_key>
   S3_PATH_STYLE_ACCESS=true
   S3_PUBLIC_URL=https://<your_custom_domain_or_r2_dev_url>
   ```

### 3. Backend Deployment (Render.com / Railway.app)
1. Connect your repository to Render/Railway.
2. Select **Docker Runtime** (the included `backend/Dockerfile` automatically compiles Java 17 and installs FFmpeg in the container).
3. Set environment variables in the Render/Railway dashboard (`JWT_SECRET`, `SPRING_DATASOURCE_URL`, `S3_*`, etc.).

### 4. Frontend Deployment (Vercel / Netlify)
1. Connect your repo and set root directory to `frontend`.
2. Set Build Command: `npm run build` and Output Directory: `dist`.
3. Set Environment Variables:
   ```env
   VITE_API_BASE_URL=https://<your-backend>.onrender.com
   VITE_WS_BASE_URL=https://<your-backend>.onrender.com/ws
   ```

---

## 📡 API Specification Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login & retrieve JWT token
- `GET /api/auth/me` — Get current user profile & partner link

### Partner Pairing (`/api/partner`)
- `POST /api/partner/invite` — Generate a 6-digit invite code
- `POST /api/partner/pair` — Redeem invite code and link partners
- `GET /api/partner/status` — Get current partner connection info
- `DELETE /api/partner/unpair` — Unpair accounts

### Video Library & Transcoding (`/api/videos`)
- `POST /api/videos/upload` — Direct multipart video upload
- `POST /api/videos/upload/chunk` — Chunked upload for large media files
- `GET /api/videos` — List all ready streaming videos
- `GET /api/videos/search?q={query}` — Full-text search catalog
- `GET /api/videos/genres/{genre}` — Filter videos by genre
- `GET /api/videos/{id}` — Get video details & resume position
- `DELETE /api/videos/{id}` — Delete video and all HLS files

### Watch Party Rooms (`/api/rooms`)
- `POST /api/rooms/create` — Create synchronized room
- `GET /api/rooms/{code}` — Get room state and media
- `PUT /api/rooms/{code}/state` — Update playback position
- `GET /api/rooms/{code}/messages` — Get room chat history
- `POST /api/rooms/{code}/messages` — Post chat message

### WebSocket STOMP Channels (`/ws`)
- **App Destinations**:
  - `/app/room/{roomCode}/sync` — Send Play / Pause / Seek / Sync requests
  - `/app/room/{roomCode}/chat` — Send chat message
  - `/app/room/{roomCode}/presence` — Send user presence (JOINED / LEFT / BUFFERING / READY)
  - `/app/room/{roomCode}/typing` — Send typing indicator
- **Subscription Topics**:
  - `/topic/room/{roomCode}/sync` — Broadcast playback updates
  - `/topic/room/{roomCode}/chat` — Broadcast chat messages
  - `/topic/room/{roomCode}/presence` — Broadcast partner presence
  - `/topic/room/{roomCode}/typing` — Broadcast typing state

---

## 🔒 Content Policy & Disclaimer

WatchTogether is a generic video streaming engine intended exclusively for personal media hosting and legally owned/licensed content. No copyrighted materials or unauthorized third-party content are hosted or distributed.

---

## 📄 License
MIT License. Built for seamless shared streaming.
