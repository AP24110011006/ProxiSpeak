# ProxiSpeak Week 4 — Interactive Screen Share & Presentation Mode UI Specification

**Engineer**: Harshitha Rao (`20harshirao18@gmail.com` / `harshithar978@gmail.com`)  
**Branch**: `harshitha` (mirrored on `harshita`)  
**Primary Directory**: `client/src/components/ScreenShareModal.jsx`  
**Deliverable Scope**: Week 4 Screen Share Viewport & Presentation Mode UI

---

## 🏛️ Component Architecture & Features

The **ScreenShareModal** provides an enterprise presentation interface for multi-user collaboration inside the *Executive Glass Boardroom* and *Dev Pods*:

1. **High-Definition Video Viewport**: Supports 1080p WebRTC display media capture streams at 30 FPS.
2. **Presenter Identity & Attendee Telemetry**: Displays the presenter's name, active room location, and live viewer count.
3. **Interactive Toolbar**:
   - Fullscreen Mode with `Fullscreen API` (`requestFullscreen` / `exitFullscreen`).
   - Picture-in-Picture (`PiP`) compatible stream routing.
   - Independent presentation audio level volume slider and mute controls.
   - Low-latency WebRTC RTT telemetry badge (`18ms`).
4. **Presenter Control Safety**: Prominent "Stop Sharing" action button for the active presenter with stream teardown confirmation.

---

## 📐 Prop Interface Contract

```typescript
interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPresenter?: boolean;
  presenterName?: string;
  roomName?: string;
  screenStream?: MediaStream | null;
  onStopSharing?: () => void;
  attendeesCount?: number;
}
```

---

## 🎨 Visual Tokens & Styling Specs

* **Container Overlay**: `rgba(15, 23, 42, 0.85)` with `backdrop-filter: blur(8px)`
* **Modal Viewport Shell**: `#0f172a` with `1px solid rgba(255, 255, 255, 0.1)` and rounded 16px corners
* **Live Broadcast Pill**: Background `rgba(239, 68, 68, 0.15)` with glowing red pulse dot
* **Fullscreen Override**: Seamless viewport expansion removing borders for presentation clarity
