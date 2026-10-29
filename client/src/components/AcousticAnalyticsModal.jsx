import { useState, useEffect } from "react";
import { X, Volume2, ShieldCheck, Gauge, Sliders, Radio, Sparkles, RefreshCw } from "lucide-react";

/**
 * Week 3: Acoustic Environment & Vocal Signal-to-Noise Ratio (SNR) Analytics Modal
 * Displays real-time room noise floors, WebRTC noise gate thresholds, and Speech Intelligibility (STI).
 * Author: Harshitha_rao854 (harshitha branch)
 */
export function AcousticAnalyticsModal({ isOpen, onClose, currentZone = "Modern Reception Lobby" }) {
  const [selectedRoom, setSelectedRoom] = useState("boardroom");
  const [noiseFloors, setNoiseFloors] = useState([
    { roomId: "focus_cabins", zoneName: "Soundproof Focus Cabins", baselineNoiseDb: 28.0, acousticRating: "Studio Ultra-Quiet (NC-25)", speechIntelligibilityIndex: 0.98, reverberationRt60: 0.18, recommendedGateThresholdDb: -52 },
    { roomId: "boardroom", zoneName: "Executive Glass Boardroom", baselineNoiseDb: 32.5, acousticRating: "Conference Damped (NC-30)", speechIntelligibilityIndex: 0.94, reverberationRt60: 0.35, recommendedGateThresholdDb: -48 },
    { roomId: "dev_pods", zoneName: "Dev Pods Collaboration", baselineNoiseDb: 44.0, acousticRating: "Open-Plan Workstation (NC-40)", speechIntelligibilityIndex: 0.86, reverberationRt60: 0.60, recommendedGateThresholdDb: -40 },
    { roomId: "reception", zoneName: "Modern Reception Lobby", baselineNoiseDb: 49.5, acousticRating: "Spacious Open Lobby (NC-45)", speechIntelligibilityIndex: 0.82, reverberationRt60: 0.80, recommendedGateThresholdDb: -36 },
    { roomId: "lounge", zoneName: "Cafeteria & Coffee Lounge", baselineNoiseDb: 55.0, acousticRating: "Social Hub & Pantry (NC-50)", speechIntelligibilityIndex: 0.74, reverberationRt60: 0.75, recommendedGateThresholdDb: -32 },
  ]);

  const [inputVoiceDb, setInputVoiceDb] = useState(68);
  const [gateThresholdDb, setGateThresholdDb] = useState(-48);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNoiseFloors = async () => {
    setIsLoading(true);
    try {
      const apiBase =
        typeof window !== "undefined" && window.location.hostname
          ? `http://${window.location.hostname}:5000`
          : "http://localhost:5000";
      const res = await fetch(`${apiBase}/api/rooms/acoustics/noise-floor`);
      const json = await res.json();
      if (json.success && json.data) {
        setNoiseFloors(json.data);
      }
    } catch (e) {
      // Retain fallback data
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNoiseFloors();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRoomData = noiseFloors.find((r) => r.roomId === selectedRoom) || noiseFloors[1];
  const calculatedSnr = Math.round((inputVoiceDb - currentRoomData.baselineNoiseDb) * 10) / 10;
  const isGateOpen = inputVoiceDb > 45;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="acoustic-analytics-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-row">
          <div className="header-icon-title">
            <div className="header-icon-badge" style={{ backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
              <Gauge size={18} />
            </div>
            <div>
              <h3 className="modal-heading">Acoustic & SNR Telemetry</h3>
              <p className="modal-subheading">Week 3 Ambient Noise Floor & Vocal Intelligibility Index</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Room Zone Selector */}
        <div className="analytics-zone-selector-row">
          {noiseFloors.map((r) => (
            <button
              key={r.roomId}
              className={`analytics-zone-chip ${selectedRoom === r.roomId ? "active" : ""}`}
              onClick={() => {
                setSelectedRoom(r.roomId);
                setGateThresholdDb(r.recommendedGateThresholdDb);
              }}
            >
              <span>{r.zoneName.split(" ")[0]}</span>
              <span className="analytics-noise-tag">{r.baselineNoiseDb}dB</span>
            </button>
          ))}
        </div>

        {/* Top Analytics Cards Grid */}
        <div className="analytics-metrics-grid">
          {/* Signal-to-Noise Ratio (SNR) */}
          <div className="analytics-card snr-card">
            <div className="analytics-card-header">
              <span className="card-title">Signal-to-Noise Ratio</span>
              <Sparkles size={14} className="text-cyan-400" />
            </div>
            <div className="snr-display-row">
              <span className="snr-main-value">+{calculatedSnr}</span>
              <span className="snr-unit">dB SNR</span>
            </div>
            <div className={`snr-quality-badge ${calculatedSnr >= 30 ? "pristine" : calculatedSnr >= 18 ? "good" : "poor"}`}>
              {calculatedSnr >= 30 ? "Pristine Studio Grade" : calculatedSnr >= 18 ? "Clear Speech Intelligibility" : "High Ambient Bleed"}
            </div>
          </div>

          {/* Speech Intelligibility Index (STI) */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <span className="card-title">Speech Intelligibility (STI)</span>
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <div className="snr-display-row">
              <span className="snr-main-value">{currentRoomData.speechIntelligibilityIndex}</span>
              <span className="snr-unit">/ 1.0</span>
            </div>
            <div className="analytics-meta-row">
              <span>{currentRoomData.acousticRating}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Voice Input & Noise Gate Controls */}
        <div className="analytics-controls-panel">
          <div className="slider-control-block">
            <div className="slider-label-row">
              <span className="slider-title">Simulated Vocal Energy:</span>
              <span className="slider-val-badge">{inputVoiceDb} dB SPL</span>
            </div>
            <input
              type="range"
              min="40"
              max="85"
              step="1"
              value={inputVoiceDb}
              onChange={(e) => setInputVoiceDb(Number(e.target.value))}
              className="analytics-slider"
            />
          </div>

          <div className="slider-control-block">
            <div className="slider-label-row">
              <span className="slider-title">WebRTC Dynamic Noise Gate:</span>
              <div className="gate-status-pill">
                <span className={`gate-dot ${isGateOpen ? "open" : "closed"}`} />
                <span>{isGateOpen ? "GATE OPEN (Audio Transmitting)" : "GATE MUTED (Background Suppressed)"}</span>
              </div>
            </div>
            <input
              type="range"
              min="-60"
              max="-25"
              step="1"
              value={gateThresholdDb}
              onChange={(e) => setGateThresholdDb(Number(e.target.value))}
              className="analytics-slider"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-row">
          <button className="refresh-metrics-btn" onClick={fetchNoiseFloors} disabled={isLoading}>
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>{isLoading ? "Reading Sensors..." : "Audit Floor Noise"}</span>
          </button>
          <button className="done-btn" onClick={onClose}>
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
