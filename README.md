# 🎬 WatchTogether

> A synchronized video streaming platform designed for two people ("partners") to browse a shared media library, watch content in frame-accurate sync, and video/audio call in real-time (Google Meet / FaceTime style) with live chat and automatic audio ducking.

---

## 🌟 Key Features

1. **Synchronized Cinema Playback**:
   - WebSocket STOMP over SockJS real-time playback synchronization (Play, Pause, Seek, Rate change) within <1 second.
   - Adaptive bitrate HLS streaming (`hls.js` on frontend) with quality levels (360p, 480p, 720p, 1080p, Auto).
2. **Face-to-Face Video Calling (Google Meet Style)**:
   - Peer-to-peer WebRTC mesh via free Google STUN (`stun:stun.l.google.com:19302`).
   - Live camera and mic toggle controls with active speaker green glow detection.
   - **Smart Audio Ducking**: Automatically dips movie audio volume when your partner speaks, ensuring clear voice communication without pausing the movie!
3. **Partner Pairing Flow**:
   - Generate shareable invite links and 8-character pairing codes.
   - Paired partners can jump into watch party rooms with 1-click.
4. **Media Transcoding Pipeline**:
   - Chunked file uploads for large video files (5MB slice transfers).
   - Async background FFmpeg transcoding produces multi-bitrate HLS playlists (`360p`, `480p`, `720p`), master manifests (`master.m3u8`), and automatic video thumbnail posters.
5. **Real-time Live Chat & Reactions**:
   - Instant chat messages, quick emoji reaction bar, and partner typing indicators.
6. **Watchlist & Resume Progress**:
   - Tracks per-user watch progress with auto-resume support.
7. **100% Free-Tier Architecture**:
   - Backend: Spring Boot 3 on Render.com or Railway.app (Docker).
   - Database: Neon.tech or Supabase free Postgres (H2 included for zero-dependency local dev).
   - Storage: Cloudflare R2 (10GB free, $0 egress fees) or MinIO / Local storage.
   - Video Calling: Free public Google STUN.
   - Frontend: React + TypeScript + Tailwind on Vercel or Netlify.

---

## 🛠 Tech Stack

- **Backend**: Java 17+, Spring Boot 3.3.3, Spring Security + JWT, Spring Data JPA, STOMP over SockJS WebSockets, AWS S3 Java SDK v2 (S3/R2-compatible), FFmpeg CLI runner.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, HLS.js, `@stomp/stompjs`, `sockjs-client`.
- **Calling**: WebRTC (RTCPeerConnection, MediaStream, Web Audio API Analyzer).

---

## 🚀 Quick Start (Local Development)

### Pre-requisites
- **Java 17+** (or Java 21)
- **Node.js 18+** & `npm`
- **FFmpeg** (optional for local transcoding; test streams are included out of the box)

---

### Step 1: Start Backend (Port 8088)

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8088` with embedded H2 database and pre-seeds 2 demo accounts:
- **Partner 1**: `alex@watchtogether.io` (Password: `password123`)
- **Partner 2**: `sam@watchtogether.io` (Password: `password123`)
*(These two accounts are already paired as partners by default!)*

---

### Step 2: Start Frontend (Port 5173)

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 👥 Testing Partner Sync & Video Calling Locally

1. Open **Window 1** (or Regular Window): Go to `http://localhost:5173/login`, click **Alex Vance**.
2. Open **Window 2** (or Incognito Window): Go to `http://localhost:5173/login`, click **Sam Rivera**.
3. In Window 1, click **Watch Party + Video Call** on any movie title (e.g. *Big Buck Bunny*).
4. Copy the room link or join using the room code in Window 2.
5. In both windows:
   - Click **Start Video Call** to enable camera and microphone!
   - Press **Play / Pause / Seek** in either window — notice the other window mirrors the action in real time!
   - Speak into your microphone — notice the speaking glow ring and movie audio dipping (audio ducking)!
   - Type in the chat — observe instant real-time delivery and typing indicators!

---

## 🐳 Docker Compose (All-in-One)

To run Postgres, MinIO (S3 storage), Backend, and Frontend in Docker:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8088`
- MinIO S3 Console: `http://localhost:9001` (User: `minioadmin`, Password: `minioadminpassword`)

---

## ☁️ Free-Tier Cloud Deployment Guide

### 1. Database (Neon.tech or Supabase)
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the JDBC connection string into `SPRING_DATASOURCE_URL`.

### 2. Object Storage (Cloudflare R2)
1. Sign up on Cloudflare and create an R2 bucket named `watchtogether`.
2. Generate an R2 API Token (Read/Write) to get `AWS_S3_ACCESS_KEY` and `AWS_S3_SECRET_KEY`.
3. Set `AWS_S3_ENDPOINT` to `https://<account-id>.r2.cloudflarestorage.com`.

### 3. Backend Deployment (Render.com / Railway)
1. Connect your repository to Render / Railway.
2. Select **Dockerfile** deployment for `/backend`.
3. Add environment variables from `.env.example`.

### 4. Frontend Deployment (Vercel / Netlify)
1. Deploy `/frontend` directory to Vercel or Netlify.
2. Set build command `npm run build` and output directory `dist`.
3. Set environment variable `VITE_API_URL` pointing to your deployed backend URL.

---

## 📜 License
MIT License. Built for educational and personal media synchronization.
