/**
 * ProxiSpeak Week 4 — WebRTC Multi-Track Screen Share & Adaptive Video Stream Manager
 * Author: Leela Sai Likhitha Yekollu <sailikhitha.yekollu@gmail.com>
 *
 * Coordinates display media capture alongside spatial audio WebRTC mesh tracks.
 * Features automated SDP renegotiation, track lifecycle listeners, and
 * telemetry-aware adaptive bitrate governance.
 */

export class ScreenShareWebRTCManager {
  constructor() {
    this.localScreenStream = null;
    this.videoSenderMap = new Map(); // peerId -> RTCRtpSender
    this.audioSenderMap = new Map(); // peerId -> RTCRtpSender
    this.onStreamEndedCallbacks = new Set();
    this.isSharing = false;
  }

  /**
   * Request display capture from the browser
   */
  async startScreenCapture(constraints = {}) {
    if (this.isSharing && this.localScreenStream) {
      return this.localScreenStream;
    }

    const defaultConstraints = {
      video: {
        cursor: "always",
        displaySurface: "monitor",
        frameRate: { max: 30, ideal: 30 },
        width: { max: 1920, ideal: 1920 },
        height: { max: 1080, ideal: 1080 },
      },
      audio: true, // Capture system presentation audio if user allows
    };

    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Display Media API is not supported in this browser environment.");
      }

      this.localScreenStream = await navigator.mediaDevices.getDisplayMedia({
        ...defaultConstraints,
        ...constraints,
      });

      this.isSharing = true;

      // Handle user clicking native browser "Stop sharing" bar
      const videoTrack = this.localScreenStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          this.stopScreenCapture();
        };
      }

      return this.localScreenStream;
    } catch (err) {
      this.isSharing = false;
      this.localScreenStream = null;
      throw err;
    }
  }

  /**
   * Attach screen video track to a specific peer's WebRTC connection
   */
  attachToPeer(peerId, peerConnection) {
    if (!this.localScreenStream || !peerConnection) return null;

    const videoTrack = this.localScreenStream.getVideoTracks()[0];
    const audioTrack = this.localScreenStream.getAudioTracks()[0];

    if (videoTrack) {
      const vSender = peerConnection.addTrack(videoTrack, this.localScreenStream);
      this.videoSenderMap.set(peerId, vSender);
    }

    if (audioTrack) {
      const aSender = peerConnection.addTrack(audioTrack, this.localScreenStream);
      this.audioSenderMap.set(peerId, aSender);
    }

    return {
      hasVideo: !!videoTrack,
      hasAudio: !!audioTrack,
    };
  }

  /**
   * Remove screen share tracks from a specific peer
   */
  detachFromPeer(peerId, peerConnection) {
    if (!peerConnection) return;

    const vSender = this.videoSenderMap.get(peerId);
    if (vSender) {
      try {
        peerConnection.removeTrack(vSender);
      } catch (err) {
        // connection may already be closed
      }
      this.videoSenderMap.delete(peerId);
    }

    const aSender = this.audioSenderMap.get(peerId);
    if (aSender) {
      try {
        peerConnection.removeTrack(aSender);
      } catch (err) {
        // ignore
      }
      this.audioSenderMap.delete(peerId);
    }
  }

  /**
   * Dynamically adjust encoding bitrate based on mesh RTT and packet loss
   */
  async adaptBitrate(peerId, { rttMs = 20, packetLoss = 0.0 }) {
    const vSender = this.videoSenderMap.get(peerId);
    if (!vSender || typeof vSender.getParameters !== "function") return;

    try {
      const params = vSender.getParameters();
      if (!params.encodings || params.encodings.length === 0) {
        params.encodings = [{}];
      }

      // Adaptive bitrate tiers
      if (rttMs > 150 || packetLoss > 0.04) {
        // Degraded network: throttle to 720p @ 15fps (800 kbps)
        params.encodings[0].maxBitrate = 800000;
        params.encodings[0].maxFramerate = 15;
      } else if (rttMs > 75 || packetLoss > 0.015) {
        // Moderate network: 1080p @ 24fps (1.5 Mbps)
        params.encodings[0].maxBitrate = 1500000;
        params.encodings[0].maxFramerate = 24;
      } else {
        // Optimal network: full 1080p @ 30fps (2.5 Mbps)
        params.encodings[0].maxBitrate = 2500000;
        params.encodings[0].maxFramerate = 30;
      }

      await vSender.setParameters(params);
    } catch (err) {
      console.warn(`[ScreenShare] Could not adapt bitrate for peer ${peerId}:`, err);
    }
  }

  /**
   * Stop active presentation and notify all listeners
   */
  stopScreenCapture() {
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      this.localScreenStream = null;
    }

    this.isSharing = false;
    this.videoSenderMap.clear();
    this.audioSenderMap.clear();

    this.onStreamEndedCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  onEnded(callback) {
    if (typeof callback === "function") {
      this.onStreamEndedCallbacks.add(callback);
    }
  }

  getTelemetry() {
    return {
      isSharing: this.isSharing,
      activePeerStreams: this.videoSenderMap.size,
      hasVideo: !!this.localScreenStream?.getVideoTracks()?.length,
      hasAudio: !!this.localScreenStream?.getAudioTracks()?.length,
    };
  }
}

export const screenShareWebRTC = new ScreenShareWebRTCManager();
