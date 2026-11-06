# ProxiSpeak Client — Week 4 WebRTC Mesh Telemetry & SLA Dashboard Specification

**Author**: Harshitha Rao <harshithar978@gmail.com>  
**Role**: Frontend UI/UX & React Engineer  
**Branch**: `harshitha` (mirrored on `harshita`)  

---

## 🎨 Component Overview: `MeshDiagnosticsModal.jsx`

The WebRTC Mesh Diagnostics Modal provides virtual office attendees and workspace administrators with real-time insight into the underlying peer-to-peer audio mesh health and network SLA compliance.

### Visual Design System
- **Theme**: Enterprise dark glassmorphism (`#0f172a` backdrop with 14px border radius).
- **Accent Glow**: Emerald-400 (`#34d399`) indicating active SLA compliance.
- **Micro-interactions**: Pulse dots on live status badges, smooth tab transitions, and animated quality breakdown bar.

---

## 📊 Telemetry Metrics Displayed

| Metric | Display Unit | Optimal Threshold | Degraded Warning Threshold |
| :--- | :--- | :--- | :--- |
| **Round-Trip Time (RTT)** | `ms` | $\le 60\text{ ms}$ | $> 120\text{ ms}$ |
| **Audio Packet Loss** | `%` | $\le 1.0\%$ | $> 4.0\%$ |
| **Jitter Buffer Delay** | `ms` | $\le 10\text{ ms}$ | $> 25\text{ ms}$ |
| **SLA Availability** | `%` | $\ge 99.9\%$ | $< 99.5\%$ |

---

## 🔌 Integration Points
- **Navbar Button**: `<Activity size={16} /> Diagnostics` with hover tooltip.
- **WebSocket Feed**: Receives real-time telemetry updates via `mesh:telemetry` and `mesh:telemetry-ack`.
- **Peer Matrix**: Displays each remote peer connected in earshot with individual latency metrics.
