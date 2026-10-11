# ProxiSpeak Architecture & Engineering Design

ProxiSpeak is a real-time virtual office ecosystem designed to replicate spontaneous in-person interactions. This document details the technical implementation across the four core modules:

---

## 1. System Overview

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      Client (Browser)                       │
 │                                                             │
 │  ┌─────────────────┐   User Input   ┌────────────────────┐  │
 │  │ Keyboard / D-Pad│───────────────>│ 60 FPS HTML5 Canvas │  │
 │  └─────────────────┘                └─────────┬──────────┘  │
 │                                               │ Position    │
 │                                               ▼             │
 │  ┌─────────────────┐  Remote Stream ┌────────────────────┐  │
 │  │   Web Audio     │<───────────────│    WebRTC Mesh     │  │
 │  │  Spatial Mixer  │                │  RTCPeerConnection │  │
 │  └─────────────────┘                └─────────▲──────────┘  │
 └──────────────┬────────────────────────────────┼─────────────┘
                │ Socket.io (WebSocket)         │ Signaling
                ▼                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                   Backend (Node.js/Express)                 │
 │                                                             │
 │  ┌─────────────────┐                ┌────────────────────┐  │
 │  │ Socket.io Server│───────────────>│ Proximity Engine   │  │
 │  │ & Auth Guards   │                │ (In-Memory + Math) │  │
 │  └─────────────────┘                └─────────┬──────────┘  │
 │                                               │ Flush       │
 │                                               ▼             │
 │  ┌─────────────────┐                ┌────────────────────┐  │
 │  │  Redis Pub/Sub  │                │ MongoDB Geospatial │  │
 │  │ (Clustering)    │                │ (2dsphere / $near) │  │
 │  └─────────────────┘                └────────────────────┘  │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. 2D Virtual World Engine (React & Canvas)

The office world is rendered on an HTML5 `<canvas>` managed inside `OfficeCanvas.jsx`:
- **60 FPS Animation Loop**: Uses native `requestAnimationFrame` with linear interpolation (`lerp`) to smooth avatar rendering across frame updates.
- **Client Prediction**: Position updates occur instantaneously on the client while network emissions are throttled to 30 Hz (every 33ms) to avoid socket flood.
- **Camera Tracking**: Centered on the user's avatar while clamped to office boundaries (`0` to `width`, `0` to `height`).
- **Obstacle Collisions**: Expanded axis-aligned bounding boxes (AABBs) prevent avatars from walking through walls, desks, or boardroom partitions.

---

## 3. Dual-Tier Proximity Engine

To support 50+ concurrent users with sub-20ms responsiveness without bottlenecking the database:

### Tier 1: Real-Time In-Memory Engine (`proximityService.js`)
- **Euclidean Distance Math**:
  $$ d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} $$
- **Proximity Threshold**: **100 pixels** (listening radius).
- **Hysteresis Buffer**: **15 pixels** (disconnection occurs at **115 pixels**), preventing connection thrashing when avatars linger at boundary edges.
- **Performance**: Audited at **1.09 ms** for 50 concurrent users (far below the 20ms project requirement).

### Tier 2: MongoDB Geospatial Layer (`User.js` & `Office.js`)
- Uses MongoDB `2dsphere` index on GeoJSON Points `[x, y]`.
- Implements `$near` queries for discovering nearby users on login.
- Implements `$geoWithin` with `$box` queries for room-level occupant grouping.

---

## 4. WebRTC Peer-to-Peer Signaling & Mesh Lifecycle

Unlike centralized audio mixers that introduce server latency and bandwidth costs, ProxiSpeak utilizes an **opportunistic P2P mesh**:
1. When two users enter within 100 pixels of each other, the backend emits `peer-entered-proximity`.
2. The user with the lower alphanumeric user ID acts as the deterministic **initiator**, calling `RTCPeerConnection.createOffer()`.
3. The peer answers via `RTCPeerConnection.createAnswer()`.
4. ICE candidates are relayed via Socket.io channels (`signal:offer`, `signal:answer`, `signal:ice-candidate`).
5. When users walk apart (>115 pixels), the server emits `peer-exited-proximity` and both peers immediately terminate the connection and recycle audio tracks.

---

## 5. Web Audio API Spatial Audio Mixer

Remote audio streams received from WebRTC are not fed directly into standard `<audio>` tags. Instead, they are routed through a Web Audio pipeline:

```
[Remote MediaStream]
         │
         ▼
[createMediaStreamSource]
         │
         ▼
    [GainNode]          <-- Distance Attenuation: gain in [0.0, 1.0]
         │
         ▼
[StereoPannerNode]      <-- Stereo Placement: pan in [-1.0, +1.0]
         │
         ▼
[audioContext.destination]
```

### Distance Attenuation
$$ \text{gain} = \left(\frac{R_{\max} - d}{R_{\max} - R_{\min}}\right)^{\text{rolloff}} \times \text{ObstacleMultiplier} $$
- Inner radius ($R_{\min} = 20\text{px}$): Full volume (1.0).
- Outer radius ($R_{\max} = 100\text{px}$): Silence (0.0).
- Walls apply an acoustic damping factor (e.g. 0.85 damping = 15% transmission).

### Stereo Panning
$$ \text{pan} = \text{clamp}\left(\frac{x_{\text{peer}} - x_{\text{listener}}}{R_{\max}}, -1.0, 1.0\right) $$
- Audio from peers on the left plays predominantly in the left ear; audio from peers on the right plays in the right ear.
- Smooth volume and panning transitions are applied using `linearRampToValueAtTime(..., 0.08s)` to avoid acoustic pops or distortion.
