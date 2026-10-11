# ProxiSpeak — Geospatial Proximity Audio Virtual Office

**Branch**: `likhitha`  
**Author**: Leela sai likhitha yekollu  
**Integration**: Synced from [`Likhitha730/ProxiSpeak`](https://github.com/Likhitha730/ProxiSpeak.git)

---

## 🚀 Implemented Features

- **Real-Time Multiplayer Canvas**: Users join a shared 900x500 virtual office workspace and see each other's avatars.
- **Live Position Synchronization**: Player movement is synchronized smoothly between browser sessions using Socket.IO (`player:move` / `player:moved`).
- **Interactive Workspace & Layout**: Canvas-rendered office featuring:
  - Dedicated glass **Meeting Room** with doorway access.
  - 8 distinct developer workstations / desks with computers.
- **AABB Collision Detection**: Prevents avatars from clipping through desks and meeting room walls while permitting doorway entry.
- **100-Pixel Proximity Detection**: Detects and displays nearby peers within the 100px hearing radius, complete with visual green radius circles.
- **Dynamic Proximity Audio Attenuation**: Computes volume dropoff based on distance `Math.max(0, 1 - distance / 100)`.
- **MongoDB 2D Spatial Index**: Persists positions in MongoDB collection with `{ position: "2d" }` index and `$near` proximity querying (with automatic in-memory fallback).
- **WebRTC Voice Chat Signaling**: Built-in microphone acquisition, voice-readiness lifecycle (`voice:ready`, `voice:stop`), and WebRTC signaling exchange (`webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate`).
- **Backend Health Check**: `/api/health` reporting server availability, connected user counts, and database status.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, HTML5 Canvas, WebRTC, Web Audio API |
| **Backend** | Node.js, Express, Socket.IO, MongoDB |
| **Database** | MongoDB Atlas / Local MongoDB (`user_positions` with `2d` index) |
| **Real-Time Transport** | WebSockets (Socket.IO) & P2P WebRTC |

---

## ⚙️ Quick Start

### 1. Start the Backend
```bash
cd server
npm install
npm run dev
# Server running at http://localhost:5000
```

### 2. Start the Frontend
In a new terminal:
```bash
cd client
npm install
npm run dev
# Frontend running at http://localhost:5173
```

### 3. Verify Health
Visit:
`http://localhost:5000/api/health`
Expected response:
```json
{
  "success": true,
  "project": "ProxiSpeak",
  "message": "Backend is running successfully",
  "database": "connected",
  "connectedUsers": 0
}
```

---

## 🧪 Testing Multiplayer & Voice

1. Open **Window 1** at `http://localhost:5173`.
2. Open **Window 2** at `http://localhost:5173` (e.g. Incognito window).
3. Use **WASD** or arrow keys to move. Notice both players moving in real-time.
4. Try moving into the meeting room through the door vs trying to walk through solid walls.
5. Move avatars within 100px of each other: the green proximity bubble connects them and shows distance in pixels.
6. Click **"Start Voice"** to activate the WebRTC proximity voice channel.
