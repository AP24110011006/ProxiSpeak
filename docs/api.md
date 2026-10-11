# ProxiSpeak API & WebSocket Protocol Reference

## 1. REST API Endpoints

### Authentication
- `POST /api/auth/register`
  - Body: `{ username, email, password, displayName?, avatarColor?, avatarShape? }`
  - Response: `{ success: true, token: string, user: UserObject }`
- `POST /api/auth/login`
  - Body: `{ emailOrUsername, password }`
  - Response: `{ success: true, token: string, user: UserObject }`
- `POST /api/auth/guest`
  - Body: `{ displayName, avatarColor? }`
  - Response: `{ success: true, token: string, user: GuestUserObject }`
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true, user: UserObject }`

### Offices
- `GET /api/offices`
  - Response: `{ success: true, offices: Office[] }`
- `GET /api/offices/:slug`
  - Response: `{ success: true, office: Office, activeUsers: UserState[] }`
- `GET /api/offices/benchmark?count=50`
  - Runs in-memory 50-user spatial clustering latency audit (<20ms).
  - Response: `{ success: true, data: { userCount: 50, executionTimeMs: number, under20msTarget: boolean }, message: string }`
- `GET /api/offices/nearby?officeId=...&x=...&y=...&radius=100`
  - Uses MongoDB `$near` 2dsphere index to query nearby users.

---

## 2. WebSocket Events (Socket.io)

### Client to Server
| Event | Payload | Description |
|---|---|---|
| `join-office` | `{ officeSlug, x, y }` | Joins office room, seeds avatar, and registers socket. |
| `move` | `{ x, y, orientation }` | Emits avatar movement step. |
| `toggle-mute` | `{ isMuted: boolean }` | Notifies peers of microphone mute state. |
| `speaking-state` | `{ isSpeaking: boolean }`| Emits local voice activity detection (VAD). |
| `signal:offer` | `{ toUserId, toSocketId, offer }` | Relays WebRTC SDP Offer. |
| `signal:answer` | `{ toUserId, toSocketId, answer }` | Relays WebRTC SDP Answer. |
| `signal:ice-candidate` | `{ toUserId, toSocketId, candidate }` | Relays ICE candidate. |

### Server to Client
| Event | Payload | Description |
|---|---|---|
| `user-joined` | `{ user }` | Broadcast when a new peer enters the office. |
| `user-moved` | `{ userId, socketId, x, y, orientation }` | Broadcasts avatar coordinate changes. |
| `user-left` | `{ userId, socketId }` | Broadcast when a peer exits or disconnects. |
| `peer-entered-proximity` | `{ peer, isInitiator }` | Dispatched when a peer enters 100px listening radius. Triggers WebRTC handshake. |
| `peer-exited-proximity` | `{ userId, distance }` | Dispatched when a peer walks beyond 115px. Triggers WebRTC teardown. |
| `proximity-update` | `{ nearbyPeers }` | Real-time distance, attenuation, and stereo pan updates. |
| `peer-spatial-update` | `{ peerId, distance, attenuation, pan }` | Reciprocal audio parameter updates. |
| `signal:offer` | `{ fromUserId, fromSocketId, offer }` | Relayed SDP Offer. |
| `signal:answer` | `{ fromUserId, fromSocketId, answer }` | Relayed SDP Answer. |
| `signal:ice-candidate` | `{ fromUserId, fromSocketId, candidate }` | Relayed ICE candidate. |
