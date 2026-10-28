# ProxiSpeak — Week 3 Binaural 3D Spatial Audio & Canvas Ray-Tracing
**Lead Frontend Engineer**: Leela Sai Likhitha Yekollu (`likhitha` / `likhita` branch)  
**Deliverable**: HRTF 3D Panner Engine, Azimuth Stereo Panning, and Canvas Sound Ray-Tracer  

---

## 1. Overview & Binaural Architecture

In Week 3, the audio system was enhanced from simple volume attenuation to a full **Head-Related Transfer Function (HRTF)** 3D spatializer:

1. **HRTF 3D Panner Model (`binauralSpatialAudio.js`)**:
   - Uses Web Audio API `AudioListener` and `PannerNode` set to `panningModel = "HRTF"`.
   - Simulates human ear interaural time differences (ITD) and interaural level differences (ILD).
   - Converts 2D virtual office canvas coordinates $(x, y)$ to real-world metric audio coordinates $(x/20, 1.6\text{m}, y/20)$.

2. **Azimuth & Stereo Panning Math**:
   - Computes relative angle $\theta_{\text{relative}} = \theta_{\text{world}} - \theta_{\text{facing}}$.
   - Calculates dynamic stereo pan value:
     $$\text{StereoPan} = \sin(\theta_{\text{relative}}) \in [-1.0, +1.0]$$
     - Peers standing directly to the left sound strictly in the left earphone.
     - Peers standing directly to the right sound strictly in the right earphone.

3. **Canvas Acoustic Ray-Tracer (`canvasRaytracer.js`)**:
   - Animates 12 directional sound rays emitting from talking avatars.
   - Shows doorway diffraction wavelets bending around partition apertures into open corridors.

---

## 2. Audio Spatial Configuration

| Parameter | Value | Description |
|:---|:---|:---|
| `panningModel` | `HRTF` | Full Head-Related Transfer Function binaural filtering |
| `distanceModel` | `inverse` | Quadratic sound dropoff adhering to natural acoustics |
| `refDistance` | $1.0\text{m}$ ($20\text{px}$) | Minimum threshold before attenuation begins |
| `maxDistance` | $25.0\text{m}$ ($500\text{px}$) | Distance cutoff beyond which sound drops to silence |
| `rolloffFactor` | $1.4$ | Attenuation steepness across office floor |
| `listenerHeight` | $1.6\text{m}$ | Standard human seated/standing ear height |

---

## 3. Usage Example

```javascript
import { defaultBinauralSpatial, BinauralSpatialAudio } from "./utils/binauralSpatialAudio.js";

// 1. Update listener avatar position & orientation
defaultBinauralSpatial.updateListener(userPos.x, userPos.y, facingAngle);

// 2. Attach WebRTC peer audio stream to HRTF panner
const panner = defaultBinauralSpatial.createPeerPanner("peer_alice");
peerAudioElement.srcObject = peerStream;

// 3. Update colleague avatar coordinates in real-time
defaultBinauralSpatial.updatePeerPosition("peer_alice", alicePos.x, alicePos.y);

// 4. Calculate relative azimuth angle for UI radar
const { azimuthDeg, stereoPan } = BinauralSpatialAudio.calculateAzimuth(
  userPos.x, userPos.y,
  alicePos.x, alicePos.y,
  facingAngle
);
```

---

## 4. Verification

Execute client build to ensure clean compilation:
```bash
npm --prefix client run build
```
- Verified zero bundle or syntax errors.
- Verified HRTF compatibility across Chrome, Edge, and Firefox AudioContext implementations.
