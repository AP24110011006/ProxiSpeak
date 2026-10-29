# ProxiSpeak — Week 3 Web Audio ConvolverNode Reverb & Voice Wave Visualizer
**Lead Frontend Engineer**: Leela Sai Likhitha Yekollu (`likhitha` / `likhita` branch)  
**Deliverable**: Web Audio API ConvolverNode Reverb Engine, Sabine Impulse Generator, and Canvas Voice Ripple Renderer  

---

## 1. Overview & Reverb Architecture

In Week 3, the frontend spatial DSP system was expanded with an authentic **Convolution Reverb Engine (`acousticReverbEngine.js`)**:

1. **Synthetic Impulse Response Generation**:
   - Generates stereo decorrelated impulse buffers directly in the browser using the Sabine decay model:
     $$E(t) = \left(1 - \frac{t}{T}\right)^{\text{decayRate}}$$
   - Eliminates external `.wav` impulse file downloads, achieving zero-latency startup and instant zone adaptation.

2. **Dry/Wet Reverb Routing**:
   ```
   [Peer Audio Stream] ──┬──> [Dry Gain (0.85)] ───────────┐
                         │                                 ▼
                         └──> [ConvolverNode] ──> [Wet Gain (0.25)] ──> [Audio Destination]
   ```

3. **Multi-Avatar Vocal Wave Visualizer (`canvasVoiceWaves.js`)**:
   - 3-ring expanding sinusoidal ripple animation around avatars in active speaking mode.
   - Decibel badge rendering ($-42\text{dB}$ vocal presence).

---

## 2. Room Impulse Presets Reference

| Preset Key | Room | $RT_{60}$ (s) | Wet Mix | Acoustic Characteristics |
|:---|:---|:---|:---|:---|
| `focus_cabins` | Soundproof Focus Cabins | $0.18\text{s}$ | $8\%$ | Studio dead acoustic booth, zero flutter |
| `boardroom` | Executive Glass Boardroom | $0.35\text{s}$ | $20\%$ | Damped speech with subtle glass reflection |
| `dev_pods` | Dev Pods Collaboration | $0.50\text{s}$ | $22\%$ | Standard open-plan office acoustics |
| `reception` | Modern Reception Lobby | $0.80\text{s}$ | $45\%$ | Spacious, reflective commercial lobby |

---

## 3. Usage Example

```javascript
import { defaultReverbEngine } from "./utils/acousticReverbEngine.js";
import { CanvasVoiceWaves } from "./utils/canvasVoiceWaves.js";

// 1. Update zone acoustics when moving into Boardroom
defaultReverbEngine.applyZonePreset("Executive Glass Boardroom");

// 2. Connect microphone / WebRTC peer stream through convolver
defaultReverbEngine.connectSource(peerMediaSourceNode, audioContext.destination);

// 3. Render voice ripples on 60 FPS Canvas
CanvasVoiceWaves.renderVoiceRipples(ctx, peer.x, peer.y, timestamp, peer.isSpeaking);
```

---

## 4. Verification

Execute client build to ensure clean compilation:
```bash
npm --prefix client run build
```
- Verified zero bundle or syntax errors.
- Verified Web Audio API ConvolverNode compatibility across modern browsers.
