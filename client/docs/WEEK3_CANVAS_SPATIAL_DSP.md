# ProxiSpeak — Week 3 Canvas Rendering & Spatial DSP Guide
**Lead Frontend Engineer**: Leela Sai Likhitha Yekollu (`likhitha` / `likhita` branch)  
**Deliverable**: 60 FPS HTML5 Canvas Floor Plan Engine, Acoustic Wall Ray Tracing, and Web Audio API Spectrum Analysis  

---

## 1. Overview & Architecture

In Week 3, the frontend canvas was upgraded from simple coordinate rendering to a physics-aware spatial audio visualizer:

1. **60 FPS Kinematic Animation Loop**: Independent `requestAnimationFrame` loop that updates local avatar velocity, click-to-move vectors, and radar sweeps without triggering React re-render cascades.
2. **Acoustic Ray Tracing**: Real-time Euclidean line-intersection detection against glass conference walls and drywalls to trigger Web Audio API `BiquadFilterNode` lowpass muffling (800Hz cutoff).
3. **Soundwave & Speaking Indicator**: Dynamic concentric sinusoidal waves (`rgba(16, 185, 129, 0.85)`) rendered around speaking avatars within 100px earshot.
4. **Fast Fourier Transform (FFT) Spectrum Analyzer**: 16-band normalized frequency bar extraction (`audioSpectrumAnalyzer.js`) mapping vocal energy into decibels ($dB$) and voice activity detection (VAD).

---

## 2. Real-Time Acoustic Zone Properties (`acousticZones.js`)

| Room ID | Room Name | Dampening | Wall Cutoff Frequency | Reverberation ($RT_{60}$) |
|:---|:---|:---|:---|:---|
| `boardroom` | Executive Glass Boardroom | 95% (Isolated) | 450 Hz (Muffled) | 0.35s |
| `focus_cabins` | Soundproof Focus Cabins | 98% (Isolated) | 350 Hz (Deep Muffle) | 0.20s |
| `dev_pods` | Dev Pods Collaboration | 20% (Open) | 1200 Hz (Crisp) | 0.60s |
| `lounge` | Cafeteria & Lounge Hub | 15% (Social) | 12000 Hz (Ambient) | 0.75s |
| `reception` | Modern Reception Lobby | 10% (Open) | 12000 Hz (Open Air) | 0.80s |

---

## 3. Web Audio API DSP Spatial Pipeline

```
[Local Microphone / Remote Peer MediaStream]
                     │
                     ▼
          [MediaStreamAudioSourceNode]
                     │
                     ▼
         [BiquadFilterNode (Lowpass)]
                     │ (Cutoff = 450Hz if wall occluded, else 12000Hz)
                     ▼
             [PannerNode (3D)]
                     │ (HRTF Panning: X, Y coordinates, Rolloff = 1.0)
                     ▼
             [GainNode (Volume)]
                     │ (Attenuation = Math.pow(1 - dist / 100, 1.8))
                     ▼
            [AudioContext.destination]
```

### Key Functions
- `calculateAcousticRayTrace(startX, startY, endX, endY)`: Detects if sound rays intersect meeting room bounding boxes.
- `getAcousticDampeningSummary(zoneName)`: Returns isolation percentage, $RT_{60}$ time, and cutoff frequency.
- `defaultSpectrumAnalyzer.getFrequencyBands(16)`: Returns array of normalized frequency values for canvas visualization.

---

## 4. Verification

Run the client build to verify zero compile or bundle errors:
```bash
npm --prefix client run build
```
- Verified Vite production build (`dist/index.html`, `dist/assets/`).
- 60 FPS requestAnimationFrame render loop verified without frame drops.
