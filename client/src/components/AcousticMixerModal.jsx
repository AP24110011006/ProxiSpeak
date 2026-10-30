import { useState } from "react";
import { X, Sliders, Volume2, VolumeX, Mic, Compass, Shield, Radio, Sparkles } from "lucide-react";

/**
 * Week 3: Multi-Channel Acoustic Spatial Mixer & Polar Pattern Control Console
 * Allows users to adjust individual peer volume faders, stereo pan balance,
 * microphone polar directivity, and solo/mute channel strips in real-time.
 * Author: Harshitha_rao854 (harshitha branch)
 */
export function AcousticMixerModal({ isOpen, onClose, livePeers = [] }) {
  const [masterVolume, setMasterVolume] = useState(85);
  const [isMasterMuted, setIsMasterMuted] = useState(false);

  // Default peer channel states if not already populated
  const defaultPeers = livePeers.length > 0 ? livePeers : [
    { id: "peer_alice", name: "Alice Developer", zone: "Modern Reception Lobby", distance: 45, isSpeaking: true },
    { id: "peer_bob", name: "Bob Designer", zone: "Dev Pod Alpha", distance: 85, isSpeaking: false },
    { id: "peer_charlie", name: "Charlie Lead", zone: "Executive Glass Boardroom", distance: 135, isSpeaking: true, isOccluded: true },
  ];

  const [channels, setChannels] = useState(() =>
    defaultPeers.reduce((acc, peer) => {
      acc[peer.id] = {
        volume: 80,
        pan: 0.0, // -1.0 Left to +1.0 Right
        isMuted: false,
        isSolo: false,
        polarPattern: "cardioid",
      };
      return acc;
    }, {})
  );

  const handleVolumeChange = (peerId, val) => {
    setChannels((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        volume: Number(val),
      },
    }));
  };

  const handlePanChange = (peerId, val) => {
    setChannels((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        pan: Number(val),
      },
    }));
  };

  const toggleMute = (peerId) => {
    setChannels((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        isMuted: !prev[peerId]?.isMuted,
      },
    }));
  };

  const toggleSolo = (peerId) => {
    setChannels((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        isSolo: !prev[peerId]?.isSolo,
      },
    }));
  };

  const handlePatternChange = (peerId, patternKey) => {
    setChannels((prev) => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        polarPattern: patternKey,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="acoustic-mixer-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-row">
          <div className="header-icon-title">
            <div className="header-icon-badge" style={{ backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="modal-heading">Multi-Channel Acoustic Mixer</h3>
              <p className="modal-subheading">Week 3 Spatial Stereo Pan, Polar Patterns & Peer Channel Strips</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Master Output Strip */}
        <div className="master-output-strip">
          <div className="master-left">
            <Radio size={16} className="text-cyan-400" />
            <div className="master-label-group">
              <span className="master-title">Master Audio Bus</span>
              <span className="master-sub">48kHz Fullband WebRTC Audio</span>
            </div>
          </div>

          <div className="master-controls">
            <div className="master-fader-row">
              <span className="fader-val-tag">{isMasterMuted ? "MUTED" : `${masterVolume}%`}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={isMasterMuted ? 0 : masterVolume}
                onChange={(e) => {
                  setMasterVolume(Number(e.target.value));
                  if (isMasterMuted) setIsMasterMuted(false);
                }}
                className="master-slider"
              />
            </div>
            <button
              className={`master-mute-btn ${isMasterMuted ? "active" : ""}`}
              onClick={() => setIsMasterMuted(!isMasterMuted)}
              title={isMasterMuted ? "Unmute master output" : "Mute master output"}
            >
              {isMasterMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* Individual Peer Channel Strips List */}
        <div className="channel-strips-container">
          {defaultPeers.map((peer) => {
            const ch = channels[peer.id] || { volume: 80, pan: 0.0, isMuted: false, isSolo: false, polarPattern: "cardioid" };
            const panLabel = ch.pan < -0.1 ? `L ${Math.abs(Math.round(ch.pan * 100))}%` : ch.pan > 0.1 ? `R ${Math.round(ch.pan * 100)}%` : "C";

            return (
              <div key={peer.id} className={`channel-strip-card ${ch.isMuted ? "muted" : ""} ${ch.isSolo ? "solo" : ""}`}>
                {/* Colleague Info */}
                <div className="channel-peer-info">
                  <div className="channel-avatar-badge">
                    <span className="avatar-dot" />
                    <strong>{peer.name}</strong>
                  </div>
                  <div className="channel-peer-meta">
                    <span>{peer.zone || "Office Floor"}</span> &bull; <span>{peer.distance || 50}px (~{Math.round((peer.distance || 50) / 10)}m)</span>
                  </div>
                  {peer.isOccluded && (
                    <span className="occluded-tag">Behind Wall (Muffled)</span>
                  )}
                </div>

                {/* Polar Pattern Selector */}
                <div className="channel-polar-group">
                  <span className="channel-sub-label">Mic Directivity:</span>
                  <div className="polar-buttons-row">
                    {["omni", "cardioid", "supercardioid"].map((pKey) => (
                      <button
                        key={pKey}
                        className={`polar-mini-chip ${ch.polarPattern === pKey ? "active" : ""}`}
                        onClick={() => handlePatternChange(peer.id, pKey)}
                      >
                        {pKey === "omni" ? "Omni 360°" : pKey === "cardioid" ? "Cardioid" : "Supercardioid"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stereo Pan Slider */}
                <div className="channel-pan-control">
                  <div className="pan-header-row">
                    <span className="channel-sub-label">Stereo Pan:</span>
                    <span className="pan-val-tag">{panLabel}</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={ch.pan}
                    onChange={(e) => handlePanChange(peer.id, e.target.value)}
                    className="pan-slider"
                  />
                  <div className="pan-axis-labels">
                    <span>L</span>
                    <span>Center</span>
                    <span>R</span>
                  </div>
                </div>

                {/* Channel Volume & Fader */}
                <div className="channel-fader-control">
                  <div className="fader-header-row">
                    <span className="channel-sub-label">Channel Level:</span>
                    <span className="fader-val-tag">{ch.isMuted ? "0%" : `${ch.volume}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ch.isMuted ? 0 : ch.volume}
                    onChange={(e) => handleVolumeChange(peer.id, e.target.value)}
                    className="channel-slider"
                  />
                </div>

                {/* Solo / Mute Actions */}
                <div className="channel-actions-row">
                  <button
                    className={`strip-btn solo-btn ${ch.isSolo ? "active" : ""}`}
                    onClick={() => toggleSolo(peer.id)}
                  >
                    Solo
                  </button>
                  <button
                    className={`strip-btn mute-btn ${ch.isMuted ? "active" : ""}`}
                    onClick={() => toggleMute(peer.id)}
                  >
                    Mute
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="modal-footer-row">
          <span className="footer-status-text">Active WebRTC Peer Channels: {defaultPeers.length}</span>
          <button className="done-btn" onClick={onClose}>
            Apply Mix
          </button>
        </div>
      </div>
    </div>
  );
}
