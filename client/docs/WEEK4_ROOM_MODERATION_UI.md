# ProxiSpeak Week 4 — Room Moderation & Host Governance UI Specification

**Engineer**: Harshitha Rao (`20harshirao18@gmail.com` / `harshithar978@gmail.com`)  
**Branch**: `harshitha` (mirrored on `harshita`)  
**Primary Directory**: `client/src/components/RoomModerationModal.jsx`  
**Deliverable Scope**: Week 4 Meeting Room Governance & Host RBAC UI

---

## 🏛️ Component Architecture & Features

The **RoomModerationModal** gives authorized hosts full administrative control over corporate meeting rooms (*Executive Glass Boardroom* and *Focus Cabins*):

1. **Host Privileges Strip**:
   - **Mute All**: One-click action to mute all non-host participants during keynotes and executive presentations.
   - **Soundproof Privacy Lock**: Toggles the 95% STC acoustic wall occlusion barrier.
2. **Attendee Roster Management**:
   - Distinct badges for `Host` vs `Participant`.
   - Host crown indicator on avatar wrappers.
   - Per-attendee quick actions: Force Mute and Eject (kick to Reception Lobby).
3. **Governance Audit Log Tab**:
   - Displays chronological, tamper-evident log of moderation actions (`HOST_CLAIMED`, `ROOM_LOCKED`, `MUTE_ALL`).

---

## 📐 Prop Interface Contract

```typescript
interface RoomModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName?: string;
  isHost?: boolean;
  hostName?: string;
  isRoomLocked?: boolean;
  attendees?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  onMuteAll?: () => void;
  onMutePeer?: (peerId: string) => void;
  onKickPeer?: (peerId: string) => void;
  onToggleLock?: () => void;
}
```

---

## 🎨 Visual Tokens & Styling Specs

* **Overlay Shell**: `rgba(15, 23, 42, 0.8)` with `backdrop-filter: blur(8px)`
* **Modal Body**: `#0f172a` with `1px solid rgba(255, 255, 255, 0.1)`
* **Host Crown Badge**: Gold gradient `#eab308` with glowing drop-shadow
* **Eject / Kick Button**: Destructive `#ef4444` hover state with warning icon
