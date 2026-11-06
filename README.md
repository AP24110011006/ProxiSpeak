# 🌐 ProxiSpeak — Virtual Corporate Office Geospatial Audio Ecosystem

An enterprise-grade, browser-based 2D virtual office platform featuring 60 FPS HTML5 canvas physics, real-time WebRTC audio mesh, Sabine acoustic reverb zones, directional polar directivity, and geospatial proximity isolation.

---

## 👥 Engineering Roles & Responsibilities

| Role | Engineer | Email | Primary Branches | Core Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Architect & Systems Lead** | **Koneti Manikanth** | `manikanth9878@gmail.com` | `manikanth` | Node.js/Express, Socket.IO, MongoDB, spatial chat, mesh telemetry, host moderation RBAC, screen share session manager |
| **Frontend UI/UX & React Engineer** | **Harshitha Rao** | `harshithar978@gmail.com` | `harshitha` / `harshita` | React 19, modal dialogs, spatial chat drawer, presentation mode, mesh diagnostics dashboard, responsive design system |
| **Canvas Spatial DSP & Audio Engineer** | **Leela Sai Likhitha Yekollu** | `sailikhitha.yekollu@gmail.com` | `likhitha` / `likhita` | 60 FPS HTML5 Canvas engine, Web Audio API, HRTF binaural panning, sidechain ducking, Sabine RT60 reverb, holographic shaders |

---

## 📅 4-Week Comprehensive Engineering Roadmap

```mermaid
flowchart TD
    subgraph W1["Week 1: Foundations"]
        A1["60 FPS Canvas World (OfficeCanvas.jsx)"]
        A2["Socket.IO Presence (proximitySocket.js)"]
        A3["User Auth & Profile Engine (AuthModal.jsx)"]
    end

    subgraph W2["Week 2: Spatial Physics & WebRTC"]
        B1["AABB Collision & Raycasting (canvasRaytracer.js)"]
        B2["100px Earshot Clustering (<20ms SLA)"]
        B3["P2P WebRTC Mesh Signaling (webrtc.js)"]
    end

    subgraph W3["Week 3: Corporate Acoustics & Sessions"]
        C1["Soundproof Meeting Cabins (RoomControlsModal.jsx)"]
        C2["HRTF Binaural 3D & 450Hz Wall Biquad (binauralSpatialAudio.js)"]
        C3["Acoustic SPL Heatmaps & Directivity Polar Patterns"]
        C4["Meeting Sessions & Analytics (MeetingSessionsModal.jsx)"]
    end

    subgraph W4["Week 4: Enterprise Collaboration & Telemetry"]
        D1["Spatial In-Earshot Chat (SpatialChatDrawer.jsx, SpatialMessage.js)"]
        D2["WebRTC Mesh Diagnostics (MeshDiagnosticsModal.jsx, meshDiagnosticsService.js)"]
        D3["Room Governance & Host RBAC (RoomModerationModal.jsx, roomModerationService.js)"]
        D4["1080p Screen Sharing (ScreenShareModal.jsx, screenShareService.js, ScreenShareSession.js)"]
        D5["-12dB Sidechain Voice Ducking (audioDuckingProcessor.js)"]
        D6["Sabine RT60 Reverb Zones & Shaders (reverbZoneManager.js, canvasScreenShareOverlay.js)"]
        D7["Adaptive Bitrate Ladder (adaptiveBandwidthManager.js)"]
    end

    W1 --> W2 --> W3 --> W4
```

---

## 🛠️ Weekly Deliverables by Role

### 1. Week 1 — Core Infrastructure
- **Koneti Manikanth (Backend)**: Express + Socket.IO server, Floor 4 seed data (`officeLayout`), real-time `office:users` state synchronization, MongoDB Schemas (`User`, `OfficeLayout`, `Audio`).
- **Harshitha Rao (Frontend)**: React 19 corporate layout, `Navbar.jsx`, `AuthModal.jsx`, `Sidebar.jsx`, CSS design system.
- **Leela Sai Likhitha Yekollu (Canvas DSP)**: HTML5 2D Canvas viewport (1000x750 normalized), WASD/Arrow keyboard loop, avatar drawing, proximity radius rings.

### 2. Week 2 — Spatial Collision & Audio Mesh
- **Koneti Manikanth (Backend)**: `<20ms` proximity clustering engine, WebRTC signaling relay (`webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate`), beacon geospatial REST endpoints.
- **Harshitha Rao (Frontend)**: `CoworkersPanel.jsx` with radar view, live status pills, broadcast creation modal, interactive controls.
- **Leela Sai Likhitha Yekollu (Canvas DSP)**: AABB collision detection, doorway pass-throughs, `canvasRaytracer.js` for acoustic line-of-sight, `canvasVoiceWaves.js` for dynamic mic visualizers.

### 3. Week 3 — Corporate Acoustics & Soundproofing
- **Koneti Manikanth (Backend)**: `roomRecordingService.js`, `audioMetricsService.js`, `spatialAudioMixerService.js`, `spatialOcclusionService.js`, confidential room audio boundaries.
- **Harshitha Rao (Frontend)**: `RoomControlsModal.jsx`, `AcousticEqualizerModal.jsx`, `AcousticMixerModal.jsx`, `AcousticAnalyticsModal.jsx`, `AudioHealthModal.jsx`, `MeetingSessionsModal.jsx`.
- **Leela Sai Likhitha Yekollu (Canvas DSP)**: `binauralSpatialAudio.js` (HRTF spatial panning), `acousticReverbEngine.js` (Sabine impulse convolution), `acousticHeatmap.js` (decibel isolines), `directionalMicrophone.js` (cardioid/hypercardioid polar patterns).

### 4. Week 4 — Collaboration, Telemetry & Host Governance
- **Koneti Manikanth (Backend)**:
  - `SpatialMessage.js`: Proximity text schema with 600-second TTL indexing and geospatial coordinate encapsulation.
  - `ScreenShareSession.js`: Real-time corporate screen sharing session tracking with adaptive bitrate ladder logs.
  - `spatialChatService.js`: Acoustic boundary message filtering preventing cross-room leakage.
  - `meshDiagnosticsService.js`: Real-time RTT latency, jitter, packet loss, and SLA health monitoring.
  - `roomModerationService.js`: Host RBAC, Soundproof privacy lock, Mute-All, and participant ejection.
  - `screenShareService.js`: Multi-room presentation session manager with viewer enrollment and duration tracking.
  - REST Routers: `/api/chat`, `/api/moderation`, `/api/mesh`, `/api/screenshare`.
  - Test suites: `week4_spatial_chat.test.mjs`, `week4_mesh_diagnostics.test.mjs`, `week4_room_moderation.test.mjs`, `week4_screen_share_session.test.mjs`, `week4_api_integration.test.mjs`.
  - Documentation: [`server/docs/WEEK4_ENTERPRISE_COLLABORATION_BACKEND.md`](file:///c:/ProxiSpeak/server/docs/WEEK4_ENTERPRISE_COLLABORATION_BACKEND.md).
- **Harshitha Rao (Frontend)**:
  - `SpatialChatDrawer.jsx`: Proximity text drawer with earshot distance indicators and confidential room locks.
  - `ScreenShareModal.jsx`: 1080p WebRTC presentation viewport with full-screen, attendee roster, and audio pass-through.
  - `ScreenSharePresenterBanner.jsx`: In-canvas live presentation status banner with quick-watch navigation.
  - `RoomModerationModal.jsx`: Governance modal with host controls (Mute All, Kick, Soundproof Lock, Audit Logs).
  - `MeshDiagnosticsModal.jsx`: WebRTC mesh telemetry dashboard with RTT, jitter, packet loss meters, and SLA compliance score.
  - Integration into `Navbar.jsx` (Diagnostics shortcut) and `App.jsx`.
  - Documentation: [`client/docs/WEEK4_FRONTEND_COMPLETE.md`](file:///c:/ProxiSpeak/client/docs/WEEK4_FRONTEND_COMPLETE.md), [`client/docs/WEEK4_MESH_DIAGNOSTICS_UI.md`](file:///c:/ProxiSpeak/client/docs/WEEK4_MESH_DIAGNOSTICS_UI.md).
- **Leela Sai Likhitha Yekollu (Canvas DSP)**:
  - `audioDuckingProcessor.js`: -12 dB sidechain voice ducking with smooth exponential gain ramps.
  - `screenShareWebRTC.js`: Multi-track WebRTC display media capture manager with adaptive bitrate throttling (500 kbps – 4000 kbps).
  - `reverbZoneManager.js`: Zone-based acoustic reverb with procedural Sabine impulse response generation (RT60: 0.25s to 2.8s).
  - `canvasScreenShareOverlay.js`: 60 FPS HTML5 Canvas presentation screen display in Boardroom & Sabine RT60 reverb aura rings.
  - `adaptiveBandwidthManager.js`: Client-side WebRTC network quality estimator and resolution downgrade ladder (1080p -> 720p -> 480p).
  - Test suite: `client/tests/week4_dsp_pipeline.test.mjs`.
  - Documentation: [`client/docs/WEEK4_CANVAS_PRESENTATION_RENDERING.md`](file:///c:/ProxiSpeak/client/docs/WEEK4_CANVAS_PRESENTATION_RENDERING.md), [`client/docs/WEEK4_ADAPTIVE_BANDWIDTH_SPEC.md`](file:///c:/ProxiSpeak/client/docs/WEEK4_ADAPTIVE_BANDWIDTH_SPEC.md).

---

## 🚀 Running the Project

### Prerequisites
- Node.js >= 18
- MongoDB running on `localhost:27017`

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
# Server listening on http://localhost:5000
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
# Vite client running on http://localhost:5173
```

### 3. Verification & Test Suites
```bash
# Backend test suites
node server/tests/week4_spatial_chat.test.mjs
node server/tests/week4_room_moderation.test.mjs
node server/tests/week4_mesh_diagnostics.test.mjs
node server/tests/week4_screen_share_session.test.mjs
node server/tests/week4_api_integration.test.mjs

# Canvas DSP test suite
node client/tests/week4_dsp_pipeline.test.mjs

# Frontend production build
npm --prefix client run build
```
