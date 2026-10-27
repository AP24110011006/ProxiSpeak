# ProxiSpeak — Week 3 UI Design System & Component Specification
**Lead Frontend Engineer**: Harshitha Rao (`harshitha` / `harshita` branch)  
**Deliverable**: Acoustic Room Privacy Modals, WebRTC Health Diagnostics, and Radar Controls  

---

## 1. Overview & UI Architecture

Week 3 delivers corporate-grade collaboration UI components designed for high responsiveness, intuitive audio feedback, and dark-mode ergonomics:

1. **Acoustic Rooms & Audio Privacy Modal (`RoomControlsModal.jsx`)**:
   - Real-time room confidentiality locks (Boardroom, Focus Cabins, Dev Pods, Lounge, Reception).
   - Sound isolation percentages (95% to 98% sound barriers).
   - In-room audio recording session toggles (`Record` / `REC Active`).
   - Hardware audio DSP toggles (Echo Cancellation, Noise Suppression, Auto Gain Control).

2. **WebRTC Mesh Diagnostics Modal (`AudioHealthModal.jsx`)**:
   - Live round-trip latency gauge (RTT in milliseconds).
   - Sub-20ms Infotact SLA verification badge (`PASSED` vs `DEGRADED`).
   - Audio jitter buffer monitor (ms) and packet loss rate (`0.02%`).
   - High-fidelity Opus 48kHz Stereo Fullband codec indicator.
   - Interactive live microphone level tester with responsive volume meter.

3. **Spatial Audio Radar Sidebar (`CoworkersPanel.jsx`)**:
   - Live peer list with real-time Euclidean distance in meters and pixels.
   - Dynamic earshot slider (60px to 260px) with 80px, 100px, and 180px presets.
   - "Walk Over" one-click avatar kinematic navigation.
   - Desk-anchored spatial audio broadcast cards with quadratic distance attenuation meters.

---

## 2. Design Tokens & Color Palette

| Token Name | Hex Value | Purpose |
|:---|:---|:---|
| Background Slate 900 | `#0f172a` | Main canvas and modal backdrop |
| Surface Slate 800 | `#1e293b` | Cards, metric boxes, and sidebar panels |
| Border Slate 700 | `#334155` | Subtle dividers and card outlines |
| Primary Cyan | `#38bdf8` | In-earshot indicators, active presets, highlights |
| Success Emerald | `#10b981` | Speaking mic waves, connected peers, optimal SLA |
| Warning Amber | `#f59e0b` | High latency warning or muffled occlusion |
| Danger Rose | `#ef4444` | Muted microphone, active recording session |
| Accent Purple | `#a855f7` | Focus cabins and Opus audio codec badges |

---

## 3. Component Hierarchy

```
App.jsx (Main Application Root)
 ├── Navbar.jsx (Status, Room Controls & Diagnostics triggers)
 ├── OfficeCanvas.jsx (60 FPS Multi-user Floor Plan)
 ├── CoworkersPanel.jsx (Spatial Radar & Audio Attenuation)
 ├── RoomControlsModal.jsx (Soundproof Locks & Audio Recording)
 ├── AudioHealthModal.jsx (Live WebRTC Mesh Latency & Jitter Monitor)
 ├── AudioBroadcastModal.jsx (Desk-Anchored Voice Memo Creator)
 └── AuthModal.jsx (JWT Corporate Login & Registration)
```

---

## 4. Verification

Run the client build to verify production bundle integrity:
```bash
npm --prefix client run build
```
- Verified zero CSS syntax or React 19 JSX errors.
- Verified modal keyboard dismissal and overlay backdrop clicks.
