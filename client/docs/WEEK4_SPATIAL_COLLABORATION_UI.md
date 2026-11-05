# ProxiSpeak Week 4 — Spatial Collaboration & In-Earshot Chat UI Specification

**Engineer**: Harshitha Rao (`20harshirao18@gmail.com` / `harshithar978@gmail.com`)  
**Branch**: `harshitha` (mirrored on `harshita`)  
**Primary Directory**: `client/src/components/SpatialChatDrawer.jsx`  
**Deliverable Scope**: Week 4 Spatial Collaboration & In-Earshot Messaging

---

## 🏛️ Architecture Overview

The **SpatialChatDrawer** introduces an enterprise proximity-bounded messaging interface where text messages follow the exact same physical acoustic propagation laws as spatial audio:

1. **Distance Attenuation Chips**: Every message received displays real-time relative distance in meters (`Math.round(distance / 10)`).
2. **Confidential Room Isolation**: When inside a locked room (such as the *Executive Glass Boardroom* or *Focus Cabins*), the drawer transitions into confidential whisper mode, restricting recipient scope to room occupants only.
3. **Reactive Earshot Telemetry**: Top banner dynamically reports active earshot radius (default 160px / 16m) and counts colleagues within hearing range.
4. **Quick Reaction Strip**: One-click emoji micro-reactions for rapid feedback during meetings.

---

## 🎨 Component State & Prop Interfaces

```typescript
interface SpatialChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentZone: string;
  isRoomLocked: boolean;
  radius: number;
  livePeers: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    distance?: number;
    inEarshot?: boolean;
  }>;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  onSendMessage?: (message: SpatialMessagePayload) => void;
}
```

---

## 📐 Design System Tokens Applied

* **Background Drawer**: `rgba(15, 23, 42, 0.96)` with `backdrop-filter: blur(16px)`
* **Borders**: `1px solid rgba(255, 255, 255, 0.1)`
* **Self Message Bubble**: Linear gradient `#4f46e5` to `#6366f1` with `#ffffff` typography
* **Peer Message Bubble**: `rgba(30, 41, 59, 0.85)` with `#e2e8f0` typography and distance chips
* **Soundproof Shield Badge**: `rgba(239, 68, 68, 0.2)` with `#f87171` indicator
