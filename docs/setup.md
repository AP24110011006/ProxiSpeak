# ProxiSpeak Setup & Getting Started Guide

## Prerequisites
- **Node.js**: v18.0.0 or higher (v24+ recommended)
- **MongoDB**: Community Server running locally on `mongodb://127.0.0.1:27017`
- **Modern Browser**: Chrome, Edge, Firefox, or Safari with Web Audio and WebRTC support

---

## 1. Quick Installation

From the repository root:

```bash
# 1. Install root, backend, and frontend dependencies
npm run install:all
```

Or install individually:
```bash
cd server && npm install
cd ../client && npm install
```

---

## 2. Environment Configuration

### Backend (`server/.env`)
A default `.env` file is prepared with sensible defaults:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/proxispeak
JWT_SECRET=proxispeak_super_secret_jwt_key_2026_dev
NODE_ENV=development
PROXIMITY_RADIUS=100
PROXIMITY_BUFFER=15
```

---

## 3. Running the Application

### Option A: Run Both Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

### Option B: Run Individually in Separate Terminals
Terminal 1 (Backend Server):
```bash
npm run server
# Server will listen on http://localhost:5000
```

Terminal 2 (Frontend Client):
```bash
npm run client
# Client will open on http://localhost:5173
```

---

## 4. Testing Proximity Voice Chat

1. Open **Tab 1** in your browser at `http://localhost:5173`.
2. Enter your name (or use Quick Join as "Alex"). Click **"Enable Mic & Audio"**.
3. Open **Tab 2** (e.g. Incognito window or second browser) at `http://localhost:5173`.
4. Enter as "Maya".
5. Use **W/A/S/D** or arrow keys to move Alex and Maya close to each other (<100 pixels):
   - Notice the green connecting proximity beam and glowing rings.
   - The WebRTC peer connection handshakes automatically.
   - The HUD displays the live distance, volume %, and stereo panning direction (e.g., "Left 65%").
6. Walk away (>100 pixels):
   - Notice the voice fades to zero volume and the connection is cleanly closed.
7. Click the **"Audit Geospatial Latency"** button on the navbar to run the live 50-user spatial benchmark (<20ms).

---

## 5. Automated Tests

Run backend unit and benchmark tests:
```bash
npm test
```
Validates Euclidean math, audio attenuation, stereo panning, and the <20ms 50-user clustering benchmark.
