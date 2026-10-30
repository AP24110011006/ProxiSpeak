# ProxiSpeak — Week 3 Spatial Audio Mixer Matrix & Multi-Channel Pipeline
**Lead Backend Engineer**: Koneti Manikanth (`manikanth` branch)  
**Deliverable**: Multi-Channel Spatial Audio Matrix Generation, Occlusion Lowpass Filtering, and Microsecond Clustering Benchmark  

---

## 1. Overview & Mathematical Formulations

Week 3 delivers a high-concurrency **Spatial Audio Multi-Channel Mixer Engine (`spatialAudioMixerService.js`)** that models the complete acoustic hearing matrix for any listener avatar surrounded by $N$ speaking colleagues across Floor 4:

### 1. Relative Azimuth & Stereo Panning
$$\theta_{\text{relative}} = \text{atan2}(y_s - y_l, x_s - x_l) - \theta_{\text{facing}}$$
$$\text{Stereo Pan} = \sin(\theta_{\text{relative}}) \in [-1.0 \text{ (Full Left)}, +1.0 \text{ (Full Right)}]$$

### 2. Distance Attenuation (Inverse Quadratic Rolloff)
$$\text{Gain}_{\text{raw}} = \begin{cases} 
\left(1 - \frac{d}{R_{\text{earshot}}}\right)^{1.8} & \text{if } d \le R_{\text{earshot}} \\
0.0 & \text{if } d > R_{\text{earshot}}
\end{cases}$$

### 3. Acoustic Room Occlusion & Lowpass Frequency Mapping
$$\text{Gain}_{\text{final}} = \text{Gain}_{\text{raw}} \cdot \max(0.02, 1 - F_{\text{occlusion}})$$
$$f_{\text{lowpass}} = \begin{cases}
16000\text{Hz} & \text{if open air (unhindered)} \\
850\text{Hz} & \text{if dry-wall occluded} \\
450\text{Hz} & \text{if soundproof glass barrier occluded}
\end{cases}$$

---

## 2. API Endpoints Reference

### `POST /api/rooms/acoustics/mix`
Computes the dynamic spatial mix matrix for a listener and multiple peers.
**Request**:
```json
{
  "listener": { "x": 220, "y": 190, "facingAngle": 0 },
  "earshotRadius": 160,
  "peers": [
    { "id": "peer_alice", "name": "Alice Reception", "x": 280, "y": 190, "isSpeaking": true },
    { "id": "peer_bob", "name": "Bob Dev Pod", "x": 220, "y": 100, "isSpeaking": false },
    { "id": "peer_charlie", "name": "Charlie Boardroom", "x": 550, "y": 180, "isSpeaking": true }
  ]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "listener": { "x": 220, "y": 190, "room": "Modern Reception Lobby" },
    "earshotRadius": 160,
    "totalColleaguesEvaluated": 3,
    "activeStreamsInEarshot": 2,
    "executionMs": 0.35,
    "sub20msSlaMet": true,
    "channels": [
      {
        "peerId": "peer_alice",
        "inEarshot": true,
        "distancePixels": 60,
        "distanceMeters": 3.0,
        "azimuthDeg": 0,
        "stereoPan": 0.0,
        "gain": 0.43,
        "gainPercent": 43,
        "isOccluded": false,
        "lowpassCutoffHz": 16000
      }
    ]
  }
}
```

### `GET /api/rooms/acoustics/benchmark?count=80`
Validates sub-20ms spatial clustering SLA across simulated office avatars.
```json
{
  "success": true,
  "service": "ProxiSpeak Spatial Audio Clustering Engine",
  "evaluatedPeersCount": 80,
  "matrixCalculations": 80,
  "executionTimeMs": 0.3,
  "targetSlaMs": 20.0,
  "sub20msSlaPassed": true,
  "timestamp": "2026-10-30T16:38:00.000Z"
}
```

---

## 3. Automated Test Pipeline Verification

Run all 12 test suites:
```bash
npm --prefix server test
```
All 12 test suites pass 100%:
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
12. `week3_spatial_mixer.test.mjs`
