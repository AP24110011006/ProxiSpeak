# ProxiSpeak Week 4 — Multi-Zone Acoustic Reverb & Sabine RT60 Decay Specification

**Engineer**: Leela Sai Likhitha Yekollu (`sailikhitha.yekollu@gmail.com`)  
**Branch**: `likhitha` (mirrored on `likhita`)  
**Primary Directory**: `client/src/utils/reverbZoneManager.js`  
**Deliverable Scope**: Week 4 Sabine RT60 Acoustic Space Modeling & Convolver DSP

---

## 🏛️ Executive Summary

The **ReverbZoneManager** introduces real-time room acoustic simulation to the ProxiSpeak virtual office floor plan. As avatars move across different architectural zones, the engine dynamically recalculates reverberation times ($RT_{60}$) and synthesizes stereo impulse responses using Wallace Sabine's reverberation equation.

---

## 📐 Mathematical Formulation

### 1. Sabine's Reverberation Formula
$$\text{RT}_{60} = \frac{0.161 \cdot V}{A} = \frac{0.161 \cdot V}{\sum_{i} S_i \alpha_i}$$

Where:
* $V$: Total room air volume in cubic meters ($m^3$).
* $S$: Total boundary surface area in square meters ($m^2$).
* $\bar{\alpha}$: Average sound absorption coefficient ($0.0 \le \bar{\alpha} \le 1.0$).
* $\text{RT}_{60}$: Time required for sound energy density to drop by $60\text{ dB}$ (one millionth of its original value).

---

### 2. Room Profiles & Measured Metrics

| Zone Name | Volume ($m^3$) | Surface ($m^2$) | Avg $\bar{\alpha}$ | $\text{RT}_{60}$ (sec) | Wet/Dry Mix | Acoustic Character |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Executive Boardroom** | 160 | 210 | 0.28 | **0.42s** | 20% | Double-pane glass dampening |
| **Reception Lobby** | 650 | 520 | 0.08 | **1.15s** | 40% | Polished tile reflection, long tail |
| **Focus Cabins** | 35 | 70 | 0.75 | **0.18s** | 5% | Acoustic foam, dead/intimate |
| **Dev Pods** | 320 | 360 | 0.22 | **0.55s** | 18% | Carpet and fabric partitions |
| **Cafeteria & Lounge** | 480 | 430 | 0.15 | **0.85s** | 32% | Open social space, warm decay |

---

### 3. Equal-Power Reverb Crossfading

To eliminate acoustic clicks or loudness dips when moving between rooms, the dry and wet channels use equal-power sinusoidal crossfading:

$$\text{Gain}_{\text{dry}} = \cos\left(\text{mix} \cdot \frac{\pi}{2}\right), \quad \text{Gain}_{\text{wet}} = \sin\left(\text{mix} \cdot \frac{\pi}{2}\right)$$

Satisfying the constant energy condition:

$$\text{Gain}_{\text{dry}}^2 + \text{Gain}_{\text{wet}}^2 = 1.0$$
