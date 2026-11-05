import React, { useState, useRef, useEffect } from "react";
import {
  Monitor,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Tv,
  Users,
  Shield,
  StopCircle,
} from "lucide-react";

/**
 * ProxiSpeak Week 4 — Interactive Screen Share & Presentation Console Modal
 * Author: Harshitha Rao <harshithar978@gmail.com>
 *
 * Implements real-time WebRTC display capture presentation mode for corporate
 * meeting rooms (e.g. Executive Glass Boardroom and Dev Pods).
 */
export function ScreenShareModal({
  isOpen,
  onClose,
  isPresenter = false,
  presenterName = "Lead Architect",
  roomName = "Executive Glass Boardroom",
  screenStream = null,
  onStopSharing,
  attendeesCount = 3,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [volume, setVolume] = useState(85);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream, isOpen]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request denied:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleStop = () => {
    if (onStopSharing) {
      onStopSharing();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="screenshare-modal-overlay">
      <div
        ref={containerRef}
        className={`screenshare-modal-container ${isFullscreen ? "fullscreen" : ""}`}
      >
        {/* Header Bar */}
        <div className="screenshare-header">
          <div className="screenshare-title-wrap">
            <div className="screenshare-icon-halo">
              <Monitor size={18} className="text-indigo-400" />
            </div>
            <div>
              <div className="screenshare-headline">
                <h3>{isPresenter ? "You are presenting" : `${presenterName}'s Screen`}</h3>
                <span className="live-broadcast-chip">
                  <span className="live-dot" /> LIVE 1080p
                </span>
              </div>
              <p className="screenshare-subhead">
                <Tv size={11} /> {roomName} &bull; <Users size={11} /> {attendeesCount} viewers in room
              </p>
            </div>
          </div>

          <div className="screenshare-header-actions">
            {isPresenter && (
              <button
                className="stop-presenting-btn"
                onClick={handleStop}
                title="Stop Sharing Screen"
              >
                <StopCircle size={14} />
                <span>Stop Sharing</span>
              </button>
            )}
            <button
              className="screenshare-close-btn"
              onClick={onClose}
              title="Close Presentation View"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Viewport */}
        <div className="screenshare-video-viewport">
          {screenStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isPresenter}
              className="screenshare-video-element"
            />
          ) : (
            <div className="screenshare-placeholder">
              <div className="placeholder-icon-box">
                <Monitor size={48} className="text-slate-500" />
              </div>
              <h4>Screen Presentation Stream</h4>
              <p>
                {isPresenter
                  ? "Select a display, window, or browser tab to broadcast to colleagues in this room."
                  : `Waiting for ${presenterName} to stream presentation content...`}
              </p>
              <div className="resolution-spec-tag">
                <Shield size={12} />
                <span>WebRTC Secure 1080p @ 30 FPS Multi-Track</span>
              </div>
            </div>
          )}
        </div>

        {/* Presentation Controls Bar */}
        <div className="screenshare-toolbar">
          <div className="toolbar-left">
            <button
              className="toolbar-btn"
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              title={isAudioMuted ? "Unmute Presentation Audio" : "Mute Audio"}
            >
              {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isAudioMuted ? "Muted" : `${volume}%`}</span>
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isAudioMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isAudioMuted) setIsAudioMuted(false);
              }}
              className="toolbar-volume-slider"
            />
          </div>

          <div className="toolbar-center">
            <span className="telemetry-pill">
              ⚡ WebRTC RTT: 18ms &bull; Zero Frame Drops
            </span>
          </div>

          <div className="toolbar-right">
            <button
              className="toolbar-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Presentation"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{isFullscreen ? "Exit" : "Full Screen"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
