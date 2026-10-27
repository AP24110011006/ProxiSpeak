# ProxiSpeak — Week 3 Backend Engineering Specification
**Lead Backend Engineer**: Koneti Manikanth (`manikanth` branch)  
**Deliverable**: Acoustic Room Soundproofing, Private Audio Sessions, and WebRTC Mesh Quality Telemetry  

---

## 1. Executive Summary & Week 3 Milestones

Week 3 focuses on transforming open-plan spatial audio into an enterprise-grade acoustic ecosystem capable of strict soundproofing for confidential corporate meetings, real-time WebRTC mesh telemetry diagnostics, and recorded audio session management.

### Week 3 Deliverables Checklist
- [x] **Acoustic Room Isolation Engine**: Ray-bounding algorithm determining whether two avatars are separated by glass partitions or privacy walls ($O(1)$ coordinate lookup).
- [x] **Soundproof Privacy Locks (`/api/rooms/:roomId/lock`)**: Dynamic isolation toggle applying 95% acoustic attenuation to Executive Boardroom and 98% to Focus Cabins.
- [x] **Meeting Audio Session Recording Service (`/api/rooms/:roomId/recording`)**: Audio session lifecycle (start, stop, status) with duration metrics, file sizing, and transcription metadata.
- [x] **WebRTC Mesh Diagnostics & Ingestion API (`/api/metrics`)**: Continuous tracking of RTT latency (< 20ms Infotact benchmark), audio jitter, and packet loss.
- [x] **Automated Test Coverage**: 9 comprehensive integration test suites with 100% automated pass rate.

---

## 2. Acoustic Room Isolation Architecture

The corporate floor plan is segmented into 5 functional acoustic zones:

| Room ID | Room Name | Acoustic Mode | Default Dampening | Locked Isolation |
|:---|:---|:---|:---|:---|
| `boardroom` | Executive Glass Boardroom | Confidential | 85% | **95% Barrier** |
| `focus_cabins` | Private Focus Cabins | Isolated | 90% | **98% Barrier** |
| `dev_pods` | Engineering Dev Pod Alpha/Beta | Collaborative | 20% | 75% Barrier |
| `reception` | Modern Reception Lobby | Open Floor | 10% | 50% Barrier |
| `lounge` | Cafeteria & Lounge Hub | Social Open | 15% | 50% Barrier |

### Isolation Calculation Formula
$$\text{Isolation}(p_1, p_2) = \begin{cases} 
0.0 & \text{if } \text{Room}(p_1) = \text{Room}(p_2) \\
\max(F_{\text{room1}}, F_{\text{room2}}, 0.95) & \text{if either room is locked} \\
0.65 & \text{if cross-boundary normal wall} \\
0.0 & \text{otherwise}
\end{cases}$$

---

## 3. WebRTC Mesh Telemetry & Audio Health Service

The `audioMetricsService` tracks peer-to-peer audio quality across all active WebSockets and WebRTC audio channels.

### Real-Time Metrics Pipeline:
1. **Client Telemetry**: Browsers invoke `RTCPeerConnection.getStats()` every 5 seconds.
2. **Telemetry Ingestion**: Clients report RTT, jitter, and packet loss to `POST /api/metrics/report`.
3. **Aggregated Audit**: System computes network-wide latency average against the `< 20ms` latency SLA.

### Health Response Schema (`GET /api/metrics/audio`):
```json
{
  "success": true,
  "service": "ProxiSpeak WebRTC Audio Mesh",
  "activePeerStreams": 2,
  "targetLatencyMs": "< 20ms",
  "currentAvgLatencyMs": 15.5,
  "currentAvgJitterMs": 1.8,
  "codec": "Opus 48kHz Stereo Fullband",
  "packetLossRate": "0.01%",
  "meshStatus": "optimal",
  "sub20msBenchmark": true,
  "timestamp": "2026-10-27T16:37:00.000Z"
}
```

---

## 4. RESTful API Endpoint Reference

### Private Meeting Rooms
- `GET /api/rooms` — Returns all 5 corporate rooms, bounding boxes, spawn points, and lock state.
- `POST /api/rooms/:roomId/lock` — Toggles confidentiality lock. Body: `{ "locked": true }`.
- `GET /api/rooms/isolation?x1=220&y1=190&x2=580&y2=200` — Computes acoustic barrier and attenuated gain between coordinates.

### Room Recording Sessions
- `POST /api/rooms/:roomId/recording/start` — Initializes high-fidelity Opus recording session. Body: `{ "initiator": "Koneti Manikanth" }`.
- `POST /api/rooms/:roomId/recording/stop` — Concludes recording session, generates duration and size summary.
- `GET /api/rooms/:roomId/recording` — Retrieves current active recording status and session history.

### Mesh Quality Metrics
- `GET /api/metrics/audio` — Aggregated WebRTC audio health and latency benchmark status.
- `GET /api/metrics/peers` — List of all individual peer-to-peer stream statistics.
- `POST /api/metrics/report` — Client reporting endpoint for WebRTC statistics.

---

## 5. Verification & Automated Test Suites

All 9 test suites are executed via:
```bash
npm --prefix server test
```
- `auth.test.mjs`: JWT authorization, password security.
- `audio.test.mjs`: Audio upload, streaming, and owner permissions.
- `proximity.test.mjs`: MongoDB 2dsphere spatial queries.
- `office_proximity.test.mjs`: 2D planar Euclidean distance and floor boundaries.
- `webrtc_signaling.test.mjs`: P2P SDP and ICE trickle signaling relay.
- `spatial_audio_broadcast_flow.test.mjs`: Real-time desk broadcasting and attenuation.
- `meeting_isolation.test.mjs`: 95% acoustic barrier verification for boardroom.
- `office_peer_sync.test.mjs`: Office occupancy sync and peer movement broadcasts.
- `week3_mesh_telemetry.test.mjs`: WebRTC mesh telemetry and room recording session lifecycle.
