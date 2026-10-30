# ProxiSpeak — Week 3 Multi-Channel Acoustic Spatial Mixer UI Specification
**Lead Frontend Engineer**: Harshitha Rao (`harshitha` / `harshita` branch)  
**Deliverable**: Multi-Channel Spatial Mixer Console, Peer Channel Strips, and Polar Directivity Controls  

---

## 1. Overview & UI Console Layout

Week 3 delivers a hardware-style **Multi-Channel Acoustic Spatial Mixer (`AcousticMixerModal.jsx`)**:

1. **Master Audio Bus**:
   - Master volume fader ($0-100\%$) with instant Master Mute toggle.
   - Monitors $48\text{kHz}$ Fullband WebRTC Audio pipeline.

2. **Per-Peer Channel Strips**:
   - **Colleague Metadata**: Avatar status bullet, name, zone location, Euclidean distance ($px$ and $m$), and occlusion badge (*Behind Wall (Muffled)*).
   - **Microphone Directivity Selector**: Fast toggling between `Omni 360°`, `Cardioid`, and `Supercardioid` polar lobes.
   - **Stereo Pan Balance**: Continuous slider with Left/Center/Right percentage readouts ($L\ 100\%$ to $R\ 100\%$).
   - **Channel Fader Level**: Individual volume fader ($0-100\%$).
   - **Solo & Mute Controls**: Dedicated `Solo` (amber `#f59e0b`) and `Mute` (red `#ef4444`) toggles for selective monitoring.

---

## 2. Component Structure

```
AcousticMixerModal
 ├── Header (Sliders icon, modal dismiss)
 ├── Master Audio Bus (Master level slider, master mute)
 ├── Channel Strips Container (Scrollable peer channels)
 │    └── ChannelStripCard
 │         ├── Peer Info & Occlusion Tag
 │         ├── Polar Pattern Buttons (Omni, Cardioid, Supercardioid)
 │         ├── Stereo Pan Slider (L / C / R)
 │         ├── Channel Volume Slider (0 - 100%)
 │         └── Solo / Mute Action Buttons
 └── Footer (Active channel count, Apply Mix action)
```

---

## 3. Verification

Run client build to verify production bundle integrity:
```bash
npm --prefix client run build
```
- Verified zero CSS syntax or JSX bundle errors.
- Verified interactive faders and pan sliders across touch and mouse input.
