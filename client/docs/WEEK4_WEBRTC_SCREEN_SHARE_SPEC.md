# ProxiSpeak Week 4 — WebRTC Multi-Track Screen Share & Adaptive Bitrate Specification

**Engineer**: Leela Sai Likhitha Yekollu (`sailikhitha.yekollu@gmail.com`)  
**Branch**: `likhitha` (mirrored on `likhita`)  
**Primary Directory**: `client/src/utils/screenShareWebRTC.js`  
**Deliverable Scope**: Week 4 Multi-Track WebRTC Media Management & Adaptive Video Governance

---

## 🏛️ Architecture Overview

The **ScreenShareWebRTCManager** integrates display media video tracks alongside ProxiSpeak's existing Web Audio spatial mesh:

1. **Multi-Track Negotiation**:
   - Audio tracks are routed through the binaural spatial audio graph.
   - Screen video tracks bypass spatial audio nodes and connect directly to peer `RTCRtpSender` objects.
2. **Dynamic Bitrate Ladder**:
   - Monitors live mesh telemetry (RTT and packet loss percentage) and adjusts encoding parameters dynamically via `RTCRtpSender.setParameters()`.

---

## 📐 Adaptive Bitrate Ladder Formulation

$$\text{Bitrate Target} = 
\begin{cases} 
2.5\text{ Mbps @ 30 FPS} & \text{if } \text{RTT} \le 75\text{ms and Loss} \le 1.5\% \\
1.5\text{ Mbps @ 24 FPS} & \text{if } 75\text{ms} < \text{RTT} \le 150\text{ms and Loss} \le 4.0\% \\
0.8\text{ Mbps @ 15 FPS} & \text{if } \text{RTT} > 150\text{ms or Loss} > 4.0\%
\end{cases}$$

---

## 🔄 Multi-Track Stream Topology

```
[Screen Display Media] ──┬──> [Video Track] ──> [RTCPeerConnection.addTrack] ──> [Peer Video Viewport]
                         │
                         └──> [System Audio] ──> [GainNode / Spatial Ducking] ──> [Binaural Mix]
```

## ⚙️ Track Lifecycle & Safety

- Intercepts native browser `track.onended` events (triggered when users click the floating browser toolbar "Stop sharing" button).
- Safely severs RTP senders without dropping the underlying WebRTC spatial voice connection.
