# ProxiSpeak — Week 3 UI Equalizer & Material Simulator Specification
**Lead Frontend Engineer**: Harshitha Rao (`harshitha` / `harshita` branch)  
**Deliverable**: 5-Band Acoustic Equalizer, Architectural Material Presets, and Room Audio Controls  

---

## 1. Overview & UI Architecture

Week 3 enhances the frontend audio control system with an intuitive **Acoustic Equalizer Modal (`AcousticEqualizerModal.jsx`)**:

1. **5-Band Hardware-Tuned Equalizer**:
   - `60 Hz` (Sub-Bass): Low frequency ambient rumble and air conditioning control.
   - `250 Hz` (Low-Mid): Boxiness and muffle attenuation.
   - `1 kHz` (Vocal Center): Core human vocal intelligibility.
   - `4 kHz` (Presence): Consonant clarity (sibilance, crispness).
   - `12 kHz` (Air / Treble): High-end room shimmer and microphone hiss filter.

2. **Architectural Material Presets**:
   - **Laminated Glass (95% Barrier)**: Simulates speech through Boardroom double-glazed partition.
   - **Acoustic Drywall (98% Barrier)**: Simulates private soundproof focus booth isolation.
   - **Fiberglass Ceiling Tiles (40% Barrier)**: Ambient room acoustic absorption ($NRC = 0.85$).
   - **Tufted Commercial Carpet (15% Barrier)**: Floor footstep and reflection dampening.

3. **One-Click Presets**:
   - **Vocal Clarity Boost**: $+4\text{dB}$ at 1kHz, $+3\text{dB}$ at 4kHz for clear WebRTC meetings.
   - **Soundproof Muffle (450Hz)**: $-8\text{dB}$ to $-20\text{dB}$ high-cut filter for speech heard outside meeting rooms.
   - **Focus Studio Dry**: Tightened dry audio with zero reverberation.
   - **Flat Acoustic Bypass**: Raw uncolored input.

---

## 2. Component Structure & State Flow

```
AcousticEqualizerModal
 ├── Header (Sliders icon badge, close action)
 ├── Preset Selector Chips (Vocal, Muffle, Studio, Flat)
 ├── 5-Band Slider Equalizer (+12dB to -12dB range)
 ├── Architectural Material Simulator (Glass, Drywall, Tiles, Carpet)
 └── Footer Actions (Reset Flat, Apply Acoustics)
```

---

## 3. Styling & Ergonomics (`App.css`)

- **Palette**: Dark slate `#0f172a` backdrop with purple `#a855f7` accent sliders.
- **Vertical Sliders**: CSS `writing-mode: vertical-lr; direction: rtl` providing authentic hardware console feel.
- **Material Cards**: Interactive responsive tiles with barrier factor chips and selected state halos.

---

## 4. Verification

Run the client build to verify production bundle integrity:
```bash
npm --prefix client run build
```
- Verified zero CSS syntax or JSX bundle errors.
- Verified slider responsiveness across touch and desktop mouse drag events.
