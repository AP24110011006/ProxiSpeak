# ProxiSpeak — Week 3 Acoustic Physics Engine & Material Absorption Guide
**Lead Backend Engineer**: Koneti Manikanth (`manikanth` branch)  
**Deliverable**: Architectural Acoustic Simulation, ISO 354 Sound Absorption Coefficients, and 2D Ray-Tracing API  

---

## 1. Overview & Physics Architecture

In Week 3, the backend spatial engine was extended with architectural acoustics modeling based on empirical laboratory standards:

1. **ISO 354 Absorption Coefficients**: Each office partition surface is assigned sound absorption coefficients across standard octave bands (125Hz, 250Hz, 500Hz, 1000Hz, 2000Hz, and 4000Hz).
2. **Sound Transmission Class (STC)**: Determines sound insulation through partitions (e.g. Boardroom acoustic glass STC 42 provides $~32\text{dB}$ to $42\text{dB}$ attenuation).
3. **2D Acoustic Ray-Tracing**: Simulates direct path sound propagation vs doorway diffraction around partition openings.
4. **Frequency-Selective Lowpass Filtering**: Walls selectively dampen higher frequencies (above 450Hz) faster than low frequencies, creating authentic muffled speech transmission through glass.

---

## 2. ISO 354 Material Absorption Matrix

| Material ID | Surface Material | STC | 125Hz | 250Hz | 500Hz | 1kHz | 2kHz | 4kHz | Barrier Factor |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| `double_glazed_glass` | Laminated Acoustic Glass (Boardroom) | **42** | 0.18 | 0.06 | 0.04 | 0.03 | 0.02 | 0.02 | **95% Barrier** |
| `acoustic_drywall` | Double Drywall with Mineral Wool | **50** | 0.28 | 0.12 | 0.08 | 0.06 | 0.06 | 0.07 | **98% Barrier** |
| `perforated_ceiling_tile` | Acoustic Fiberglass Ceiling Tile | **35** | 0.65 | 0.85 | 0.90 | 0.95 | 0.90 | 0.85 | **40% Barrier** |
| `commercial_carpet` | Heavy Commercial Tufted Carpet | **25** | 0.08 | 0.24 | 0.57 | 0.69 | 0.71 | 0.73 | **15% Barrier** |
| `open_air_doorway` | Unobstructed Doorway Aperture | **0** | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | **0% Barrier** |

---

## 3. Mathematical Propagation Model

### 1. Distance Attenuation ($dB$)
$$\text{Loss}_{\text{dist}}(d) = 20 \cdot \log_{10}(\max(1, d))$$

### 2. Frequency Transmission Loss ($dB$)
$$\text{TL}(f) = \text{STC} \cdot (1 - 0.4 \cdot \alpha_f) + d \cdot \text{Loss}_{\text{air}}$$

### 3. Transmitted Acoustic Gain
$$\text{Gain}_{\text{acoustic}} = 10^{-\frac{\text{Loss}_{\text{dist}} + \text{TL}}{20}}$$

When an avatar speaks inside the Boardroom and a listener stands outside in the Reception Lobby:
- $\text{Cutoff Frequency} = 450\text{Hz}$ (Muffled speech).
- $\text{Acoustic Gain} \le 5\%$ (95% confidential soundproofing).

---

## 4. API Endpoint Specifications

### `GET /api/rooms/acoustics/materials`
Returns full table of architectural materials with absorption curves.
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "double_glazed_glass",
      "name": "Laminated Acoustic Glass (Boardroom)",
      "soundTransmissionClass": 42,
      "soundproofBarrierFactor": 0.95
    }
  ]
}
```

### `POST /api/rooms/acoustics/raytrace`
Computes ray-trace simulation between source and target coordinates.
**Request**:
```json
{
  "x1": 500,
  "y1": 180,
  "x2": 220,
  "y2": 190
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "directDistancePixels": 280,
    "distanceMeters": 14,
    "crossesAcousticPartition": true,
    "primaryMaterial": "Laminated Acoustic Glass (Boardroom)",
    "attenuation": {
      "lowpassCutoffHz": 450,
      "soundproofBarrierFactor": 0.95
    },
    "acousticGainFactor": 0.02
  }
}
```

---

## 5. Automated Test Suite Verification

Run the complete 10-suite backend test pipeline:
```bash
npm --prefix server test
```
All 10 test suites pass 100%:
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
