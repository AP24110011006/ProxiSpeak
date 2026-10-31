# Week 3: Unified Web Audio DSP Pipeline Architecture

**Author**: Likhitha730 (`likhitha` branch)  
**Deliverable**: Canvas Spatial Engine & Complete Web Audio DSP Pipeline  
**Target File**: [`client/src/utils/audioPipelineIntegrator.js`](file:///c:/ProxiSpeak/client/src/utils/audioPipelineIntegrator.js)

---

## 🎛️ DSP Audio Graph Overview

The `AudioPipelineIntegrator` orchestrates the complete Web Audio processing chain for all incoming peer voice streams in ProxiSpeak:

```
[Peer MediaStreamSource]
           │
           ▼
[Directivity / Polar Pattern Gain] (Cardioid / Supercardioid / Omni / Figure-8)
           │
           ▼
[Biquad Low-Pass Filter] (Cutoff: 20kHz open-air -> 450Hz drywall / 850Hz glass occlusion)
           │
           ▼
[PannerNode (HRTF)] (Inverse distance decay, 3D interaural time & level differences)
      │          │
      │          ▼
      │     [ConvolverNode Reverb Send] (Sabine room impulse response)
      │          │
      ▼          ▼
[Channel Gain & Mute Fader]
      │
      ├──────────────────► [Channel AnalyserNode] (16-band FFT visualizer)
      ▼
[Master Dynamics Compressor] (Threshold: -12dB, Knee: 30dB, Ratio: 12:1)
      │
      ▼
[Master Gain Bus]
      │
      ▼
[AudioContext Destination (Speakers / Headphones)]
```

---

## 🔬 Core DSP Features

1. **HRTF Binaural 3D Spatial Audio**:
   - Computes earshot distance and angular azimuth relative to listener head orientation.
   - Panning model: `HRTF` with inverse distance rolloff.

2. **Acoustic Wall Occlusion Filter**:
   - Smooth exponential frequency transition using `setTargetAtTime()`.
   - When avatars speak across boardroom glass or drywall partitions, high frequencies above 450Hz are absorbed.

3. **Multi-Pattern Directivity**:
   - Dynamically calculates polar sensitivity $P(\theta)$ based on facing direction relative to the listener.
   - Suppresses background office noise and off-axis employee chatter.

4. **Multi-Channel FFT Analysis**:
   - 16-band frequency visualization per peer for visual feedback on speaker engagement.

5. **Clamping & Anti-Clipping**:
   - Master dynamics compressor node prevents digital distortion when multiple avatars speak simultaneously in clustered meetings.
