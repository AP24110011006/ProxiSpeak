# ProxiSpeak: Week 1 Backend Foundation (Signaling, Movement & Geospatial Engine)

**Branch**: `manikanth`  
**Milestone**: Week 1 - Real-Time Office Signaling & Movement Foundation

---

## 🎯 Week 1 Backend Objectives & Deliverables

As outlined in the Infotact Solutions project roadmap:
- **Signaling & Movement**: Build the Node.js + Socket.io WebSocket server to broadcast real-time avatar X/Y coordinates across virtual office rooms.
- **Geospatial Schemas**: Implement MongoDB schemas with `2dsphere` indexes to track spatial user positions (`location: { type: 'Point', coordinates: [X, Y] }`) and office layouts.
- **Boundary & Collision Engine**: Enforce office map limits and obstacle collisions (walls, conference tables, desks) on the server.
- **Deliverable**: Enables two browser sessions to connect via WebSockets and see each other's avatars moving in real-time.

---

## 🏗️ Architecture & Modules (`server/`)

```
server/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB Mongoose connection
│   │   └── redis.js             # Redis Pub/Sub scaling adapter (fallback enabled)
│   ├── models/
│   │   ├── User.js              # User profile & 2dsphere GeoJSON location schema
│   │   ├── Office.js            # Office dimensions, zones, and obstacles
│   │   └── Room.js              # Conference room schemas
│   ├── controllers/
│   │   ├── authController.js    # JWT auth, registration, and guest access
│   │   ├── officeController.js  # Office layouts & spatial benchmarks
│   │   └── userController.js    # Profile & avatar customizations
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth endpoints
│   │   ├── officeRoutes.js      # /api/offices endpoints
│   │   └── userRoutes.js        # /api/users endpoints
│   ├── services/
│   │   ├── presenceService.js   # In-memory tracking of active sockets & X/Y positions
│   │   ├── officeService.js     # Office layout persistence & default seeding
│   │   └── proximityService.js  # Dual-tier proximity engine & Euclidean calculations
│   ├── sockets/
│   │   ├── socketServer.js      # Socket.io bootstrap with JWT authentication
│   │   ├── movementHandler.js   # Validates boundaries, collisions, and broadcasts 'user-moved'
│   │   ├── presenceHandler.js   # Handles 'join-office', 'user-joined', 'user-left', disconnect
│   │   └── signalingHandler.js  # WebRTC signaling relays
│   ├── middleware/
│   │   ├── authenticate.js      # JWT token & socket auth guards
│   │   ├── errorHandler.js      # Centralized error handler
│   │   └── rateLimiter.js       # Rate limiter
│   ├── utils/
│   │   └── distance.js          # Euclidean distance & AABB collision math
│   ├── app.js                   # Express app configuration
│   └── server.js                # HTTP server & WebSocket bootstrap
└── tests/
    ├── movement.test.js         # Week 1 movement & geospatial tests
    └── proximity.test.js        # Proximity math & <20ms benchmark tests
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **MongoDB** running on `mongodb://127.0.0.1:27017`

### 2. Install Dependencies
```bash
npm install --prefix server
```

### 3. Environment Variables (`server/.env`)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/proxispeak
JWT_SECRET=proxispeak_super_secret_jwt_key_2026_dev
NODE_ENV=development
PROXIMITY_RADIUS=100
PROXIMITY_BUFFER=15
```

### 4. Run the Server
```bash
npm run server
# Server listening on http://localhost:5000
```

### 5. Run Backend Tests
```bash
npm test
```
Validates:
- Avatar coordinate calculations and Euclidean distance.
- Office boundary clamping and obstacle collision detection.
- MongoDB `2dsphere` GeoJSON Point schema structure.
