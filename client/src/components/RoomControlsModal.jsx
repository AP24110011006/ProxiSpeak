import { useState, useEffect } from "react";
import { X, Lock, Unlock, Shield, Mic, Sliders, Volume2, Users } from "lucide-react";

export function RoomControlsModal({ isOpen, onClose, currentZone = "Modern Reception Lobby" }) {
  const [rooms, setRooms] = useState([
    { id: "boardroom", name: "Executive Glass Boardroom", icon: "📊", isLocked: true, soundproofFactor: 0.95, mode: "confidential" },
    { id: "focus_cabins", name: "Soundproof Focus Cabins", icon: "🎧", isLocked: true, soundproofFactor: 0.98, mode: "private" },
    { id: "dev_pods", name: "Main Open-Plan Dev Area", icon: "💻", isLocked: false, soundproofFactor: 0.20, mode: "collaborative" },
    { id: "lounge", name: "Cozy Coffee Lounge & Pantry", icon: "☕", isLocked: false, soundproofFactor: 0.15, mode: "social" },
    { id: "reception", name: "Modern Reception Lobby", icon: "🏢", isLocked: false, soundproofFactor: 0.10, mode: "open" }
  ]);

  const [audioSettings, setAudioSettings] = useState({
    echoCancellation: true,
    noiseSuppression: true,
    autoGain: true,
    whisperMode: false
  });

  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchRooms = async () => {
      try {
        const apiBase = typeof window !== "undefined" && window.location.hostname
          ? `http://${window.location.hostname}:5000`
          : "http://localhost:5000";
        const res = await fetch(`${apiBase}/api/rooms`);
        const json = await res.json();
        if (json.success && json.data) {
          setRooms(json.data);
        }
      } catch (e) {
        // Fallback to local default state
      }
    };
    fetchRooms();
  }, [isOpen]);

  const toggleRoomLock = async (roomId) => {
    setLoadingId(roomId);
    try {
      const apiBase = typeof window !== "undefined" && window.location.hostname
        ? `http://${window.location.hostname}:5000`
        : "http://localhost:5000";
      const target = rooms.find((r) => r.id === roomId);
      const res = await fetch(`${apiBase}/api/rooms/${roomId}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locked: !target?.isLocked })
      });
      const json = await res.json();
      if (json.success) {
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, isLocked: json.isLocked } : r))
        );
      }
    } catch (e) {
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, isLocked: !r.isLocked } : r))
      );
    } finally {
      setLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-container-card"
        style={{ maxWidth: "620px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 className="modal-title-text">Acoustic Rooms & Audio Privacy</h3>
              <p className="modal-subtitle-text">
                Manage soundproof room isolation and audio filtering
              </p>
            </div>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-scrollable-body" style={{ padding: "16px 24px" }}>
          {/* Active Zone Card */}
          <div style={{ background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(148, 163, 184, 0.15)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current User Zone</span>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc", marginTop: "2px" }}>{currentZone}</div>
            </div>
            <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.2)", color: "#10b981", fontWeight: "600" }}>
              Active Floor 4
            </span>
          </div>

          {/* Room Soundproof Cards List */}
          <h4 style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            Corporate Acoustic Isolation Zones
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
            {rooms.map((room) => (
              <div
                key={room.id}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: room.isLocked ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid rgba(148, 163, 184, 0.12)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>{room.icon || "🏢"}</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#f1f5f9" }}>{room.name}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      Sound Isolation: <strong>{Math.round((room.soundproofFactor || 0.1) * 100)}%</strong> • {room.isLocked ? "Soundproof Barrier Active" : "Open Audio Bleed"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleRoomLock(room.id)}
                  disabled={loadingId === room.id}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: room.isLocked ? "rgba(56, 189, 248, 0.2)" : "rgba(148, 163, 184, 0.15)",
                    color: room.isLocked ? "#38bdf8" : "#94a3b8",
                    transition: "all 0.15s ease"
                  }}
                >
                  {room.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>{room.isLocked ? "Locked" : "Unlocked"}</span>
                </button>
              </div>
            ))}
          </div>

          {/* WebRTC Audio DSP Enhancements */}
          <h4 style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            Acoustic Signal Processing (DSP)
          </h4>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(148, 163, 184, 0.12)", borderRadius: "8px", padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={audioSettings.echoCancellation}
                onChange={(e) => setAudioSettings({ ...audioSettings, echoCancellation: e.target.checked })}
              />
              Echo Cancellation (AEC)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={audioSettings.noiseSuppression}
                onChange={(e) => setAudioSettings({ ...audioSettings, noiseSuppression: e.target.checked })}
              />
              Noise Suppression (DNS)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={audioSettings.autoGain}
                onChange={(e) => setAudioSettings({ ...audioSettings, autoGain: e.target.checked })}
              />
              Auto Gain Control (AGC)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={audioSettings.whisperMode}
                onChange={(e) => setAudioSettings({ ...audioSettings, whisperMode: e.target.checked })}
              />
              Confidential Whisper Mode
            </label>
          </div>
        </div>

        <div className="modal-footer-row" style={{ padding: "14px 24px", borderTop: "1px solid rgba(148, 163, 184, 0.15)", display: "flex", justifyContent: "flex-end" }}>
          <button className="primary-action-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
