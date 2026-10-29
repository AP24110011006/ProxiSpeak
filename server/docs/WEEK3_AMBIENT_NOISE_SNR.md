# ProxiSpeak — Week 3 Ambient Noise Floor & Voice SNR Telemetry Guide
**Lead Backend Engineer**: Koneti Manikanth (`manikanth` branch)  
**Deliverable**: Ambient Noise Measurement, Signal-to-Noise Ratio (SNR) Engine, and Dynamic WebRTC Noise Gate  

---

## 1. Overview & Physics Architecture

In Week 3, the backend audio ecosystem was expanded to measure real-time ambient acoustic noise floors across Floor 4 and compute **Signal-to-Noise Ratio (SNR)** for active WebRTC vocal channels:

1. **Noise Criterion (NC) Ratings**: Each corporate zone is characterized by a baseline noise floor level ($dB$ SPL):
   - **Focus Cabins**: $28.0\text{dB}$ (Studio Ultra-Quiet, NC-25).
   - **Executive Boardroom**: $32.5\text{dB}$ (Conference Damped, NC-30).
   - **Dev Pods**: $44.0\text{dB}$ (Open-Plan Active, NC-40).
   - **Reception Lobby**: $49.5\text{dB}$ (Spacious Open, NC-45).
   - **Cafeteria Lounge**: $55.0\text{dB}$ (Social Pantry Hub, NC-50).

2. **Signal-to-Noise Ratio (SNR)**:
   $$\text{SNR}_{\text{dB}} = \text{Input Vocal Energy (dB)} - \text{Zone Noise Floor (dB)}$$
   - $\ge 32\text{dB}$: **Pristine Studio Grade** (Minimal suppression required).
   - $20 - 31\text{dB}$: **Clear Commercial Voice** (Standard WebRTC suppression).
   - $12 - 19\text{dB}$: **Moderate Background Bleed** (High suppression).
   - $< 12\text{dB}$: **Degraded / High Noise Floor** (Maximum suppression).

3. **Speech Transmission Index (STI)**:
   Quantifies vocal intelligibility ($0.0$ to $1.0$). Focus Cabins score $0.98$ (Excellent), while Cafeteria Lounge scores $0.74$ (Fair).

---

## 2. API Endpoints Reference

### `GET /api/rooms/acoustics/noise-floor`
Returns ambient noise floors and $RT_{60}$ times for all zones.
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "roomId": "focus_cabins",
      "zoneName": "Soundproof Focus Cabins",
      "baselineNoiseDb": 28.0,
      "acousticRating": "Studio Ultra-Quiet (NC-25)",
      "speechIntelligibilityIndex": 0.98,
      "reverberationRt60": 0.18,
      "recommendedGateThresholdDb": -52
    }
  ]
}
```

### `POST /api/rooms/acoustics/snr`
Computes SNR and recommended noise-gate threshold.
**Request**:
```json
{
  "roomId": "focus_cabins",
  "inputVoiceDb": 68.0
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "roomId": "focus_cabins",
    "inputVoiceDb": 68.0,
    "ambientNoiseFloorDb": 28.0,
    "signalToNoiseRatioDb": 40.0,
    "qualityStatus": "Pristine Studio Grade",
    "speechIntelligibilityIndex": 0.98,
    "recommendedGateThresholdDb": -52,
    "suppressionAggressiveness": "low"
  }
}
```

---

## 3. Automated Test Pipeline Verification

Run the complete 11-suite backend test suite:
```bash
npm --prefix server test
```
All 11 test suites pass 100%:
1. `auth.test.mjs`
2. `audio.test.mjs`
3. `proximity.test.mjs`
4. `office_proximity.test.mjs`
5. `webrtc_signaling.test.mjs`
6. `spatial_audio_broadcast_flow.test.mjs`
7. `meeting_isolation.test.mjs`
8. `office_peer_sync.test.mjs`
9. `week3_mesh_telemetry.test.mjs`
10. `week3_acoustic_diffraction.test.mjs`
11. `week3_ambient_snr.test.mjs`
