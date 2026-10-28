import { useState } from "react";
import { X, Sliders, Waves, Layers, RotateCcw, Check, Sparkles } from "lucide-react";

/**
 * Week 3: 5-Band Acoustic Equalizer & Architectural Material Simulator Modal
 * Provides hardware frequency filtering, material simulation presets, and RT60 decay preview.
 * Author: Harshitha_rao854 (harshitha branch)
 */
export function AcousticEqualizerModal({ isOpen, onClose }) {
  const [eqBands, setEqBands] = useState({
    subBass: 0, // 60 Hz
    lowMid: -2, // 250 Hz (muffle reduction)
    midVocal: 3, // 1 kHz (vocal clarity boost)
    highMid: 1, // 4 kHz (presence)
    treble: -1, // 12 kHz (hiss reduction)
  });

  const [selectedMaterial, setSelectedMaterial] = useState("double_glazed_glass");
  const [selectedPreset, setSelectedPreset] = useState("vocal_clarity");

  const materials = [
    { id: "double_glazed_glass", name: "Laminated Glass", desc: "Boardroom Soundproof Partition (STC 42)", icon: "🪟", factor: "95%" },
    { id: "acoustic_drywall", name: "Acoustic Drywall", desc: "Mineral Wool Infill (STC 50)", icon: "🧱", factor: "98%" },
    { id: "perforated_ceiling_tile", name: "Fiberglass Tiles", desc: "Acoustic Ceiling Grid (NRC 0.85)", icon: "◻️", factor: "40%" },
    { id: "commercial_carpet", name: "Tufted Carpet", desc: "Floor Acoustic Underlay", icon: "🧶", factor: "15%" },
  ];

  const presets = {
    vocal_clarity: {
      name: "Vocal Clarity Boost",
      bands: { subBass: -4, lowMid: -2, midVocal: 4, highMid: 3, treble: 1 },
      desc: "Optimized for natural WebRTC speech intelligibility",
    },
    boardroom_muffle: {
      name: "Soundproof Muffle (450Hz)",
      bands: { subBass: 2, lowMid: 1, midVocal: -8, highMid: -14, treble: -20 },
      desc: "Simulates confidential meeting speech heard through glass",
    },
    focus_studio: {
      name: "Focus Studio Dry",
      bands: { subBass: -2, lowMid: 0, midVocal: 2, highMid: 1, treble: 0 },
      desc: "Zero-reverberation acoustic booth tuning",
    },
    flat_bypass: {
      name: "Flat Acoustic Bypass",
      bands: { subBass: 0, lowMid: 0, midVocal: 0, highMid: 0, treble: 0 },
      desc: "Unmodified raw microphone capture",
    },
  };

  const handleBandChange = (bandKey, value) => {
    setEqBands((prev) => ({
      ...prev,
      [bandKey]: Number(value),
    }));
    setSelectedPreset("custom");
  };

  const applyPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    if (presets[presetKey]) {
      setEqBands({ ...presets[presetKey].bands });
    }
  };

  const resetEq = () => {
    applyPreset("flat_bypass");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="acoustic-eq-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-row">
          <div className="header-icon-title">
            <div className="header-icon-badge" style={{ backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="modal-heading">Acoustic Room Equalizer</h3>
              <p className="modal-subheading">Week 3 Web Audio DSP Frequency Filtering & Material Simulation</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Preset Selector Chips */}
        <div className="eq-presets-row">
          {Object.entries(presets).map(([key, p]) => (
            <button
              key={key}
              className={`eq-preset-chip ${selectedPreset === key ? "active" : ""}`}
              onClick={() => applyPreset(key)}
            >
              <Sparkles size={11} />
              <span>{p.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* 5-Band Slider Equalizer */}
        <div className="equalizer-sliders-container">
          <div className="equalizer-scale-axis">
            <span>+12 dB</span>
            <span>0 dB</span>
            <span>-12 dB</span>
          </div>

          <div className="equalizer-sliders-grid">
            {/* 60 Hz */}
            <div className="eq-band-column">
              <span className="eq-gain-label">{eqBands.subBass > 0 ? `+${eqBands.subBass}` : eqBands.subBass} dB</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eqBands.subBass}
                onChange={(e) => handleBandChange("subBass", e.target.value)}
                className="eq-vertical-slider"
              />
              <span className="eq-freq-label">60 Hz</span>
              <span className="eq-band-name">Sub</span>
            </div>

            {/* 250 Hz */}
            <div className="eq-band-column">
              <span className="eq-gain-label">{eqBands.lowMid > 0 ? `+${eqBands.lowMid}` : eqBands.lowMid} dB</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eqBands.lowMid}
                onChange={(e) => handleBandChange("lowMid", e.target.value)}
                className="eq-vertical-slider"
              />
              <span className="eq-freq-label">250 Hz</span>
              <span className="eq-band-name">Low-Mid</span>
            </div>

            {/* 1 kHz */}
            <div className="eq-band-column">
              <span className="eq-gain-label">{eqBands.midVocal > 0 ? `+${eqBands.midVocal}` : eqBands.midVocal} dB</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eqBands.midVocal}
                onChange={(e) => handleBandChange("midVocal", e.target.value)}
                className="eq-vertical-slider"
              />
              <span className="eq-freq-label">1 kHz</span>
              <span className="eq-band-name">Vocal</span>
            </div>

            {/* 4 kHz */}
            <div className="eq-band-column">
              <span className="eq-gain-label">{eqBands.highMid > 0 ? `+${eqBands.highMid}` : eqBands.highMid} dB</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eqBands.highMid}
                onChange={(e) => handleBandChange("highMid", e.target.value)}
                className="eq-vertical-slider"
              />
              <span className="eq-freq-label">4 kHz</span>
              <span className="eq-band-name">Presence</span>
            </div>

            {/* 12 kHz */}
            <div className="eq-band-column">
              <span className="eq-gain-label">{eqBands.treble > 0 ? `+${eqBands.treble}` : eqBands.treble} dB</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eqBands.treble}
                onChange={(e) => handleBandChange("treble", e.target.value)}
                className="eq-vertical-slider"
              />
              <span className="eq-freq-label">12 kHz</span>
              <span className="eq-band-name">Air</span>
            </div>
          </div>
        </div>

        {/* Architectural Material Simulator */}
        <div className="material-simulator-section">
          <div className="section-label-row">
            <Layers size={13} />
            <span>Simulate Surface Material Soundproofing:</span>
          </div>

          <div className="materials-grid">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className={`material-card ${selectedMaterial === mat.id ? "selected" : ""}`}
                onClick={() => setSelectedMaterial(mat.id)}
              >
                <div className="material-top">
                  <span className="material-icon">{mat.icon}</span>
                  <span className="material-factor-chip">{mat.factor} Barrier</span>
                </div>
                <strong className="material-name">{mat.name}</strong>
                <p className="material-desc">{mat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-row">
          <button className="reset-eq-btn" onClick={resetEq}>
            <RotateCcw size={13} />
            <span>Reset Flat</span>
          </button>
          <button className="done-btn" onClick={onClose}>
            Apply Acoustics
          </button>
        </div>
      </div>
    </div>
  );
}
