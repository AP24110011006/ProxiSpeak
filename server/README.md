# ProxiSpeak Backend Engine & Geospatial Signaling Server

The **ProxiSpeak Backend** powers real-time WebRTC mesh signaling, MongoDB geospatial and planar Euclidean proximity queries, desk-anchored audio broadcast streaming, and spatial cluster auditing.

---

## 🏗️ Architecture & Core Components

```
server/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB Mongoose connection with local/Atlas fallback
│   │   └── storage.js           # Multer disk engine for audio file uploads & stream URLs
│   ├── controllers/
│   │   ├── audioController.js   # Spatial audio upload, streaming, update, and deletion
│   │   ├── authController.js    # JWT authentication, bcrypt password hashing, login/register
│   │   └── userController.js    # User profiles, avatar customization, status updates
│   ├── middleware/
│   │   ├── authenticate.js      # Stateless JWT Bearer token validator
│   │   ├── errorHandler.js      # Global JSON error formatting & HTTP status codes
│   │   └── rateLimiter.js       # Express rate limiter against burst traffic
│   ├── models/
│   │   ├── Audio.js             # Dual-mode coordinates: 2dsphere GeoJSON & planar (x, y)
│   │   ├── OfficeLayout.js      # Zones, collision boundaries, and acoustic wall absorption
│   │   └── User.js              # User credentials, roles, email uniqueness, coordinates
│   ├── routes/
│   │   ├── audioRoutes.js       # /api/audio (upload, nearby, stream, delete)
│   │   ├── authRoutes.js        # /api/auth (login, register, me)
│   │   ├── officeRoutes.js      # /api/office (layout, occlusion, benchmark)
│   │   └── userRoutes.js        # /api/users (profile, directory, status)
│   ├── sockets/
│   │   └── proximitySocket.js   # 30Hz spatial proximity evaluation, WebRTC mesh signaling
│   └── app.js                   # Express application setup, CORS, and routing
├── tests/                       # 6 Comprehensive Automated Integration Test Suites
│   ├── auth.test.mjs
│   ├── audio.test.mjs
│   ├── proximity.test.mjs
│   ├── office_proximity.test.mjs
│   ├── webrtc_signaling.test.mjs
│   └── spatial_audio_broadcast_flow.test.mjs
└── server.js                    # HTTP + WebSocket bootstrapper on port 5000
```

---

## 📡 RESTful API Endpoints

### 1. Health & Benchmarks
- `GET /api/health`: System health check, MongoDB connectivity status, uptime.
- `GET /api/office/benchmark?count=50`: Sub-20ms spatial clustering benchmark for concurrent office avatars.
- `GET /api/office/layout`: Floor 4 office layout, zone coordinates, and acoustic partition obstacles.

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new corporate user (`name`, `email`, `password`).
- `POST /api/auth/login`: Authenticate credentials, issues signed JWT token (7-day validity).
- `GET /api/auth/me`: Validate JWT Bearer token and return active user profile.

### 3. Spatial Audio Broadcasts (`/api/audio`)
- `POST /api/audio/upload`: Upload voice memo or audio file anchored to avatar desk coordinates (`x`, `y`).
- `GET /api/audio/nearby`: Query desk broadcasts within auditory earshot (`x`, `y`, `radius`).
- `GET /api/audio/stream/:id`: Stream audio file with HTTP byte-range support.
- `DELETE /api/audio/:id`: Delete broadcast (authenticated to owner).

### 4. Week 3: Private Acoustic Meeting Rooms (`/api/rooms`)
- `GET /api/rooms`: List all corporate office rooms with privacy lock state, acoustic dampening ratings, and occupant capacity.
- `POST /api/rooms/:roomId/lock`: Toggle soundproof privacy lock for confidential meetings in Executive Glass Boardroom or Focus Cabins.
- `GET /api/rooms/isolation`: Calculate real-time acoustic sound barrier isolation between listener and speaker coordinates (e.g., 95% barrier for locked boardroom).

---

## ⚡ Real-Time WebRTC Mesh Signaling (`proximitySocket.js`)

The Socket.IO signaling server operates at port `5000`:

| Event | Direction | Description |
| :--- | :--- | :--- |
| `user:identify` | Client -> Server | Register user profile and avatar identity with socket |
| `user:move` | Client -> Server | Broadcast avatar (x, y) coordinates on the floor plan |
| `webrtc:peer-in-range` | Server -> Client | Fired when colleague enters 100px earshot; triggers WebRTC P2P |
| `webrtc:peer-out-of-range` | Server -> Client | Fired when colleague exits 150px hysteresis; closes peer connection |
| `webrtc:offer` | Bi-directional | Relays SDP Offer from initiator to target peer |
| `webrtc:answer` | Bi-directional | Relays SDP Answer back to initiator |
| `webrtc:ice-candidate` | Bi-directional | Relays ICE trickle candidates for NAT/firewall traversal |

---

## 🧪 Automated Test Suites

Run all 7 test suites with:

```bash
npm test --prefix server
```

1. **Authentication Suite (`auth.test.mjs`)**: Registration, login, duplicate rejection, and JWT authorization.
2. **Audio Management Suite (`audio.test.mjs`)**: Multer disk persistence, streaming, metadata patching, and owner permissions.
3. **Geospatial Proximity Suite (`proximity.test.mjs`)**: MongoDB `2dsphere` spatial indexing and distance sorting.
4. **Corporate Planar Proximity Suite (`office_proximity.test.mjs`)**: Euclidean distance calculations, zone bounding, and zero-leakage acoustic boundaries.
5. **WebRTC Signaling Suite (`webrtc_signaling.test.mjs`)**: Earshot triggers, peer clustering, and SDP/ICE signaling relay.
6. **Spatial Audio Broadcast Suite (`spatial_audio_broadcast_flow.test.mjs`)**: End-to-end employee desk broadcasting and listener attenuation.
7. **Week 3 Meeting Room Isolation Suite (`meeting_isolation.test.mjs`)**: Soundproof barrier verification, room privacy lock, and coordinate-to-room mapping.
