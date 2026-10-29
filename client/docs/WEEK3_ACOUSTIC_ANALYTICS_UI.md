# ProxiSpeak — Week 3 UI Acoustic Analytics & Voice SNR Specification
**Lead Frontend Engineer**: Harshitha Rao (`harshitha` / `harshita` branch)  
**Deliverable**: Acoustic Analytics Modal, Signal-to-Noise Ratio (SNR) Gauge, and Dynamic WebRTC Noise Gate  

---

## 1. Overview & UI Architecture

Week 3 delivers enterprise acoustic telemetry visualization through the **Acoustic & SNR Telemetry Modal (`AcousticAnalyticsModal.jsx`)**:

1. **Live Zone Noise Floor Selector**:
   - Focus Cabins: $28.0\text{dB}$ (Studio Ultra-Quiet)
   - Executive Boardroom: $32.5\text{dB}$ (Conference Damped)
   - Dev Pods: $44.0\text{dB}$ (Open-Plan)
   - Reception Lobby: $49.5\text{dB}$ (Open Floor)
   - Cafeteria Lounge: $55.0\text{dB}$ (Social Pantry)

2. **Signal-to-Noise Ratio (SNR) Metrics Gauge**:
   - Calculates live SNR:
     $$\text{SNR}_{\text{dB}} = \text{Vocal Level} - \text{Ambient Floor}$$
   - Status Badges:
     - **Pristine Studio Grade** ($\ge 30\text{dB}$ SNR, emerald badge `#34d399`)
     - **Clear Speech Intelligibility** ($18-29\text{dB}$ SNR, cyan badge `#38bdf8`)
     - **High Ambient Bleed** ($< 18\text{dB}$ SNR, rose badge `#f87171`)

3. **Dynamic WebRTC Noise Gate Controller**:
   - Interactive threshold slider ($-60\text{dB}$ to $-25\text{dB}$).
   - Real-time Gate State Indicator:
     - `GATE OPEN`: Glowing green bullet (`#10b981`), audio packet streams passing through.
     - `GATE MUTED`: Red bullet (`#ef4444`), background floor noise muted.

---

## 2. Component Structure

```
AcousticAnalyticsModal
 ├── Header (Gauge icon badge, dismiss action)
 ├── Zone Selection Chips (Focus, Boardroom, Dev, Reception, Lounge)
 ├── Analytics Cards Grid (SNR main display, Speech Intelligibility Index)
 ├── Noise Gate Controller (Vocal Energy slider, WebRTC gate threshold)
 └── Footer Actions (Audit Floor Noise, Apply Settings)
```

---

## 3. Verification

Execute client build to verify production bundle integrity:
```bash
npm --prefix client run build
```
- Verified zero CSS syntax or JSX bundle errors.
- Verified slider responsiveness across touch and desktop mouse drag events.
