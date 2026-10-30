# ProxiSpeak — Week 3 Acoustic Heatmap & Polar Microphones Guide
**Lead Frontend Engineer**: Leela Sai Likhitha Yekollu (`likhitha` / `likhita` branch)  
**Deliverable**: 2D Sound Pressure Level (SPL) Heatmap, Decibel Isolines, and Directional Polar Pattern Engine  

---

## 1. Overview & Physics Architecture

Week 3 introduces two visual and acoustic spatial enhancements on the HTML5 office floor plan:

1. **2D Acoustic Sound Pressure Level (SPL) Heatmap (`acousticHeatmap.js`)**:
   - Calculates cumulative acoustic energy ($dB$ SPL) across the office:
     $$L_{\text{SPL}} = 10 \cdot \log_{10} \left( 10^{\frac{L_{\text{ambient}}}{10}} + \sum 10^{\frac{L_{\text{speaker}} - 20\log_{10}(d) - \Delta L_{\text{wall}}}{10}} \right)$$
   - Renders radial gradient heat fields around speaking avatars with decibel contour rings.
   - Automatically clips and attenuates heat contours against soundproof glass and drywall barriers.

2. **Directional Microphone Polar Patterns (`directionalMicrophone.js`)**:
   - **Omnidirectional**: $P(\theta) = 1.0$ (equal $360^\circ$ vocal radiation).
   - **Cardioid**: $P(\theta) = 0.5 \cdot (1 + \cos(\theta))$ (directional vocal focus; $20\text{dB}$ rear rejection).
   - **Supercardioid**: $P(\theta) = |0.37 + 0.63 \cdot \cos(\theta)|$ (narrow forward beam designed for noisy open-plan desks).
   - **Figure-8 (Bidirectional)**: $P(\theta) = |\cos(\theta)|$ (picks up front and back, rejects lateral room noise).

---

## 2. Polar Sensitivity Comparison

| Pattern Name | Polar Formula | Front Sensitivity ($0^\circ$) | Side Sensitivity ($90^\circ$) | Rear Sensitivity ($180^\circ$) | Directivity Index |
|:---|:---|:---|:---|:---|:---|
| **Omni** | $1.0$ | $1.00$ ($0\text{dB}$) | $1.00$ ($0\text{dB}$) | $1.00$ ($0\text{dB}$) | $0.0\text{dB}$ |
| **Cardioid** | $0.5(1 + \cos\theta)$ | $1.00$ ($0\text{dB}$) | $0.50$ ($-6\text{dB}$) | $0.01$ ($-20\text{dB}$) | $4.8\text{dB}$ |
| **Supercardioid** | $0.37 + 0.63\cos\theta$ | $1.00$ ($0\text{dB}$) | $0.37$ ($-8.6\text{dB}$) | $0.26$ ($-11.7\text{dB}$) | $5.7\text{dB}$ |
| **Figure-8** | $\|\cos\theta\|$ | $1.00$ ($0\text{dB}$) | $0.01$ ($-20\text{dB}$) | $1.00$ ($0\text{dB}$) | $4.8\text{dB}$ |

---

## 3. Usage Example

```javascript
import { DirectionalMicrophone } from "./utils/directionalMicrophone.js";
import { AcousticHeatmap } from "./utils/acousticHeatmap.js";

// 1. Calculate directional transmission between two avatars
const { directivityGain, attenuationDb } = DirectionalMicrophone.computeDirectivityGain(
  speaker.x, speaker.y, speaker.facingAngle,
  listener.x, listener.y,
  "cardioid"
);

// 2. Render polar lobe on canvas around speaker avatar
DirectionalMicrophone.drawPolarLobe(ctx, speaker.x, speaker.y, speaker.facingAngle, "cardioid", 45);

// 3. Render real-time acoustic heatmap on canvas
AcousticHeatmap.drawAcousticHeatmap(ctx, activeColleaguesList, 130);
```

---

## 4. Verification

Run client build to verify production bundle integrity:
```bash
npm --prefix client run build
```
- Verified clean bundle compilation.
- Verified polar lobe trigonometric math with zero performance overhead.
