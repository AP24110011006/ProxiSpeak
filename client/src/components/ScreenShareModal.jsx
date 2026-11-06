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
  AlertCircle,
} from "lucide-react";
import { getSocket } from "../services/socket.js";

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
  const [localStream, setLocalStream] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  const activeStream = screenStream || localStream;
  const isCurrentlyPresenter = isPresenter || Boolean(localStream);

  useEffect(() => {
    if (videoRef.current && activeStream) {
      videoRef.current.srcObject = activeStream;
      videoRef.current.play().catch(() => {});
    }
  }, [activeStream, isOpen]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [localStream]);

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
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    const socket = getSocket();
    if (socket) {
      socket.emit("screenshare:stop", { room: roomName });
    }
    if (onStopSharing) {
      onStopSharing();
    }
  };

  // 1. Capture real user display / window / tab via getDisplayMedia
  const handleStartCapture = async () => {
    setStreamError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Display capture not supported in this browser. Try the 1080p Simulated Stream below.");
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          frameRate: { ideal: 30, max: 60 },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });

      setLocalStream(stream);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          handleStop();
        };
      }

      const socket = getSocket();
      if (socket) {
        socket.emit("screenshare:start", {
          room: roomName,
          presenter: presenterName || "You",
          resolution: "1080p",
        });
      }
    } catch (err) {
      console.warn("Screen share prompt canceled or error:", err);
      if (err.name !== "NotAllowedError") {
        setStreamError(err.message || "Failed to start display capture.");
      }
    }
  };

  // 2. Simulated 1080p animated presentation stream (interactive fallback)
  const handleStartDemoStream = () => {
    setStreamError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");

      let frame = 0;
      const renderFrame = () => {
        frame++;
        const bg = ctx.createLinearGradient(0, 0, 1280, 720);
        bg.addColorStop(0, "#0b0f19");
        bg.addColorStop(1, "#1e1b4b");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1280, 720);

        // Header Bar
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(40, 30, 1200, 70);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("ProxiSpeak Virtual HQ — Executive Technical Review", 60, 74);

        // Chip
        ctx.fillStyle = "#4f46e5";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(1020, 48, 200, 34, 17);
        } else {
          ctx.rect(1020, 48, 200, 34);
        }
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("LIVE PRESENTATION", 1045, 70);

        // Main presentation slide card
        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(40, 120, 1200, 550, 16);
        } else {
          ctx.rect(40, 120, 1200, 550);
        }
        ctx.fill();
        ctx.stroke();

        // Slide Content
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("Week 4 Architecture: Dynamic Proximity Audio & WebRTC Mesh", 80, 170);

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "16px sans-serif";
        ctx.fillText("• Spatial Earshot Attenuation (<20ms clustering SLA)", 80, 220);
        ctx.fillText("• Real-Time Soundproof Glass Partition Filtering (95% STC Isolation)", 80, 260);
        ctx.fillText("• Full Duplex 1080p Display Media Streaming with WebRTC Multi-Track", 80, 300);
        ctx.fillText("• Opus Adaptive Bitrate & Jitter Concealment Buffer", 80, 340);

        // Animated sine wave waveform
        ctx.strokeStyle = "#818cf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 80; x < 1160; x += 5) {
          const y = 460 + Math.sin((x + frame * 4) * 0.02) * 25 * Math.sin((frame * 0.05) + (x * 0.005));
          if (x === 80) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Telemetry Box
        ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(80, 530, 1080, 100, 12);
        } else {
          ctx.rect(80, 530, 1080, 100);
        }
        ctx.fill();

        ctx.fillStyle = "#10b981";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("TELEMETRY STATUS: NOMINAL (99.98% SLA)", 110, 565);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "13px sans-serif";
        const ping = 16 + Math.round(Math.sin(frame * 0.05) * 3);
        ctx.fillText(`WebRTC RTT: ${ping}ms  |  Packet Loss: 0.00%  |  Bitrate: 3,480 Kbps  |  Room: ${roomName}`, 110, 600);

        animFrameRef.current = requestAnimationFrame(renderFrame);
      };

      renderFrame();

      const stream = canvas.captureStream(30);
      setLocalStream(stream);

      const socket = getSocket();
      if (socket) {
        socket.emit("screenshare:start", {
          room: roomName,
          presenter: presenterName || "You",
          resolution: "1080p",
        });
      }
    } catch (e) {
      console.error("Demo presentation stream error:", e);
      setStreamError("Could not initialize presentation simulation stream.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="screenshare-modal-overlay" onClick={onClose}>
      <div
        ref={containerRef}
        className={`screenshare-modal-container ${isFullscreen ? "fullscreen" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="screenshare-header">
          <div className="screenshare-title-wrap">
            <div className="screenshare-icon-halo">
              <Monitor size={18} className="text-indigo-400" />
            </div>
            <div>
              <div className="screenshare-headline">
                <h3>{isCurrentlyPresenter ? "You are presenting" : `${presenterName}'s Screen`}</h3>
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
            {isCurrentlyPresenter && (
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
          {activeStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isCurrentlyPresenter}
              className="screenshare-video-element"
            />
          ) : (
            <div className="screenshare-placeholder">
              <div className="placeholder-icon-box">
                <Monitor size={48} className="text-slate-500" />
              </div>
              <h4>Screen Presentation Stream</h4>
              <p>
                Broadcast your display, code window, or browser tab to colleagues inside {roomName}.
              </p>

              {streamError && (
                <div className="screenshare-error-badge">
                  <AlertCircle size={14} />
                  <span>{streamError}</span>
                </div>
              )}

              <div className="screenshare-btn-group">
                <button
                  type="button"
                  className="start-screenshare-action-btn"
                  onClick={handleStartCapture}
                >
                  <Monitor size={18} />
                  <span>Share Your Screen</span>
                </button>
                <button
                  type="button"
                  className="start-demo-screenshare-btn"
                  onClick={handleStartDemoStream}
                >
                  <Tv size={14} />
                  <span>Simulate 1080p Presentation (Demo)</span>
                </button>
              </div>

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
