# ProxiSpeak Week 4 — Dynamic Voice-Over-Music Audio Ducking Engine Specification

**Engineer**: Leela Sai Likhitha Yekollu (`sailikhitha.yekollu@gmail.com`)  
**Branch**: `likhitha` (mirrored on `likhita`)  
**Primary Directory**: `client/src/utils/audioDuckingProcessor.js`  
**Deliverable Scope**: Week 4 Canvas Spatial DSP & Audio Ducking

---

## 🏛️ Executive Summary

In a multi-user corporate virtual office, background audio (such as desk audio memos, presentation streams, or ambient noise) can mask conversational voice chat.

The **AudioDuckingProcessor** implements sidechain dynamic compression:
Whenever any colleague within earshot begins speaking, background audio channels are instantaneously attenuated by $-12\text{ dB}$ (gain factor $0.251$), allowing human voice intelligibility to take precedence.

---

## 📐 Mathematical Formulation

### 1. Decibel to Linear Gain Attenuation
$$\text{Gain}_{\text{ducked}} = 10^{\frac{\Delta \text{dB}}{20}} = 10^{\frac{-12}{20}} \approx 0.2512$$

### 2. Continuous Exponential Gain Scheduling
Using Web Audio API's `GainNode.gain.setTargetAtTime(target, startTime, timeConstant)`:

$$V(t) = V_{\text{target}} + (V_0 - V_{\text{target}}) \cdot e^{-\frac{t - t_0}{\tau}}$$

Where:
* **Attack Time Constant ($\tau_{\text{attack}}$)**: $40\text{ms}$ ($0.04\text{s}$) — rapid drop before vocal syllables are masked.
* **Release Time Constant ($\tau_{\text{release}}$)**: $350\text{ms}$ ($0.35\text{s}$) — natural, click-free expansion back to unity gain when speech ceases.

---

## 🎛️ Audio Graph Topology

```
[Desk Audio Broadcasts / Ambient] ──> [AudioDuckingProcessor GainNode] ──> [Master Audio Destination]
                                                    ▲
                                                    │ Sidechain Control Signal
[Colleague WebRTC Mic VAD] ─────────── [Speech Activity Detector]
```
