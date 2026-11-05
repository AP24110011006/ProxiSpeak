import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Lock,
  ShieldCheck,
  FileText,
  Play,
  Pause,
  Download,
  Search,
  Users,
  Radio,
  Archive,
  Volume2,
  CheckCircle2,
} from "lucide-react";

/**
 * Week 3: Recorded Meeting Sessions & Acoustic Archive Console
 * Displays persistent room meeting sessions, audio recordings, durations,
 * participant rosters, and soundproof isolation audit compliance.
 * Author: Harshitha_rao854 (harshitha branch)
 */
export function MeetingSessionsModal({ isOpen, onClose, roomId = "boardroom" }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingSessionId, setPlayingSessionId] = useState(null);

  // Mock initial meeting sessions for room archive
  const [sessions, setSessions] = useState([
    {
      id: "sess_exec_001",
      title: "Executive Boardroom Acoustic Strategy Sync",
      roomId: "boardroom",
      roomName: "Executive Glass Boardroom",
      date: "2026-10-31T09:00:00Z",
      duration: 240, // 4 mins
      audioUrl: "/uploads/audio/exec_sync_oct31.webm",
      isSoundproofLocked: true,
      isolationRating: 95,
      participants: [
        { name: "Koneti Manikanth", role: "Backend Architect", avatar: "👨‍💻" },
        { name: "Likhitha", role: "DSP Lead", avatar: "👩‍🔬" },
        { name: "Harshitha Rao", role: "UI/UX Engineer", avatar: "👩‍🎨" },
      ],
      notes: "Discussed sub-20ms spatial clustering and 100px earshot WebRTC audio mesh.",
    },
    {
      id: "sess_focus_002",
      title: "Focus Pod Deep Work: Biquad Filter Tuning",
      roomId: "focus-a",
      roomName: "Focus Cabin Alpha",
      date: "2026-10-31T10:30:00Z",
      duration: 180, // 3 mins
      audioUrl: "/uploads/audio/focus_pod_oct31.webm",
      isSoundproofLocked: true,
      isolationRating: 90,
      participants: [
        { name: "Likhitha", role: "DSP Lead", avatar: "👩‍🔬" },
      ],
      notes: "Calibrated 450Hz low-pass wall occlusion filter and Sabine RT60 reverb.",
    },
    {
      id: "sess_lounge_003",
      title: "Breakout Lounge Open Standup",
      roomId: "breakout",
      roomName: "Breakout Creative Lounge",
      date: "2026-10-31T11:45:00Z",
      duration: 360, // 6 mins
      audioUrl: "/uploads/audio/breakout_standup_oct31.webm",
      isSoundproofLocked: false,
      isolationRating: 40,
      participants: [
        { name: "Koneti Manikanth", role: "Backend Architect", avatar: "👨‍💻" },
        { name: "Harshitha Rao", role: "UI/UX Engineer", avatar: "👩‍🎨" },
      ],
      notes: "Reviewed Week 3 multi-branch git architecture and automated test pipelines.",
    },
  ]);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "locked") return s.isSoundproofLocked;
    if (activeTab === "boardroom") return s.roomId === "boardroom";
    if (activeTab === "focus") return s.roomId.startsWith("focus");
    return true;
  });

  const togglePlayAudio = (sessionId) => {
    if (playingSessionId === sessionId) {
      setPlayingSessionId(null);
    } else {
      setPlayingSessionId(sessionId);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `proxispeak_meeting_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-overlay meeting-sessions-modal-backdrop" onClick={onClose}>
      <div
        className="modal-card meeting-sessions-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sessions-modal-title"
      >
        {/* Header */}
        <div className="modal-header sessions-header">
          <div className="header-left">
            <div className="sessions-icon-wrapper">
              <Archive className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 id="sessions-modal-title" className="sessions-title">
                Meeting Room Session Archives
              </h2>
              <p className="sessions-subtitle">
                Persistent spatial audio recordings & confidential meeting compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="sessions-close-btn"
            aria-label="Close meeting sessions modal"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="sessions-toolbar">
          <div className="search-bar-wrapper">
            <Search className="w-4 h-4 search-icon" />
            <input
              type="text"
              placeholder="Search sessions by title, room, or participant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sessions-search-input"
            />
          </div>

          <div className="sessions-filter-tabs">
            <button
              className={`filter-tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All ({sessions.length})
            </button>
            <button
              className={`filter-tab-btn ${activeTab === "locked" ? "active" : ""}`}
              onClick={() => setActiveTab("locked")}
            >
              <Lock className="w-3 h-3 inline-icon" /> Soundproof
            </button>
            <button
              className={`filter-tab-btn ${activeTab === "boardroom" ? "active" : ""}`}
              onClick={() => setActiveTab("boardroom")}
            >
              Boardroom
            </button>
            <button
              className={`filter-tab-btn ${activeTab === "focus" ? "active" : ""}`}
              onClick={() => setActiveTab("focus")}
            >
              Focus Pods
            </button>
          </div>
        </div>

        {/* Session Cards List */}
        <div className="sessions-scroll-area">
          {filteredSessions.length === 0 ? (
            <div className="empty-sessions-state">
              <Archive className="w-12 h-12 text-gray-600 mb-2" />
              <p className="text-gray-400 font-medium">No recorded meeting sessions found</p>
              <p className="text-xs text-gray-500">Try adjusting your filter or search query</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div key={session.id} className="session-item-card">
                <div className="session-item-top">
                  <div className="session-title-group">
                    <h3 className="session-card-title">{session.title}</h3>
                    <div className="session-badges-row">
                      <span className="room-badge">{session.roomName}</span>
                      <span className="duration-badge">
                        <Clock className="w-3 h-3" /> {formatDuration(session.duration)}
                      </span>
                      {session.isSoundproofLocked ? (
                        <span className="soundproof-badge">
                          <ShieldCheck className="w-3 h-3" /> {session.isolationRating}% Soundproof
                        </span>
                      ) : (
                        <span className="open-boundary-badge">
                          <Radio className="w-3 h-3" /> Open Spatial
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="session-audio-actions">
                    <button
                      onClick={() => togglePlayAudio(session.id)}
                      className={`session-play-btn ${playingSessionId === session.id ? "playing" : ""}`}
                      title={playingSessionId === session.id ? "Pause playback" : "Play recording"}
                    >
                      {playingSessionId === session.id ? (
                        <>
                          <Pause className="w-4 h-4 text-amber-400" />
                          <span>Playing</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-emerald-400" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                    <a
                      href={session.audioUrl}
                      download={`session_${session.id}.webm`}
                      className="session-download-btn"
                      title="Download audio recording"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {playingSessionId === session.id && (
                  <div className="session-inline-player">
                    <div className="player-indicator">
                      <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-400 font-mono">
                        Simulating Web Audio Spatial Stream ({formatDuration(session.duration)})
                      </span>
                    </div>
                    <div className="player-scrubber-track">
                      <div className="player-scrubber-progress"></div>
                    </div>
                  </div>
                )}

                <p className="session-notes-text">{session.notes}</p>

                <div className="session-item-footer">
                  <div className="participants-pills">
                    <Users className="w-3.5 h-3.5 text-gray-500 mr-1" />
                    {session.participants.map((p, idx) => (
                      <span key={idx} className="participant-chip" title={`${p.name} (${p.role})`}>
                        <span className="avatar-emoji">{p.avatar}</span>
                        <span className="participant-name">{p.name.split(" ")[0]}</span>
                      </span>
                    ))}
                  </div>

                  <div className="session-date-tag">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer sessions-modal-footer">
          <div className="footer-compliance-info">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Encrypted WebRTC Audio Persistence & ISO 27001 Audit Ready</span>
          </div>
          <div className="footer-actions">
            <button onClick={handleExportAudit} className="export-audit-btn">
              <FileText className="w-4 h-4 mr-1.5" />
              Export Audit Log
            </button>
            <button onClick={onClose} className="sessions-dismiss-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default MeetingSessionsModal;
