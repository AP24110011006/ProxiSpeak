/**
 * Week 3: Private Acoustic Meeting Room Audio Session & Recording Service
 * Manages active room recording sessions, participant presence, and meeting summaries.
 */

const activeRecordings = new Map();
const completedRecordings = [];

export const roomRecordingService = {
  /**
   * Start an acoustic audio recording session in a meeting room
   * @param {string} roomId - e.g. "boardroom", "cabin_alpha"
   * @param {string} initiator - User name or ID starting the recording
   */
  startRecording(roomId, initiator = "Admin") {
    if (!roomId) throw new Error("Room ID is required to start recording");

    if (activeRecordings.has(roomId)) {
      return {
        isAlreadyRecording: true,
        session: activeRecordings.get(roomId),
      };
    }

    const session = {
      sessionId: `rec_${roomId}_${Date.now()}`,
      roomId,
      initiator,
      startedAt: new Date().toISOString(),
      status: "recording",
      audioSampleRate: "48000Hz (Opus High Fidelity)",
      channels: 2,
    };

    activeRecordings.set(roomId, session);
    return {
      isAlreadyRecording: false,
      session,
    };
  },

  /**
   * Stop an active recording session and generate meeting session metadata
   * @param {string} roomId
   */
  stopRecording(roomId) {
    if (!roomId || !activeRecordings.has(roomId)) {
      return null;
    }

    const session = activeRecordings.get(roomId);
    activeRecordings.delete(roomId);

    const endedAt = new Date().toISOString();
    const durationSeconds = Math.max(
      1,
      Math.round((new Date(endedAt) - new Date(session.startedAt)) / 1000)
    );

    const finalized = {
      ...session,
      status: "completed",
      endedAt,
      durationSeconds,
      formattedDuration: `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`,
      fileSizeKb: Math.round(durationSeconds * 16), // ~16KB/s at 128kbps Opus
      transcriptPreview: `[ProxiSpeak AI Transcript: Confidential session held in ${roomId}. Audio preserved with spatial isolation.]`,
    };

    completedRecordings.unshift(finalized);
    if (completedRecordings.length > 50) completedRecordings.pop();

    return finalized;
  },

  /**
   * Get recording status for a specific meeting room
   * @param {string} roomId
   */
  getRoomRecordingStatus(roomId) {
    const isRecording = activeRecordings.has(roomId);
    return {
      roomId,
      isRecording,
      currentSession: isRecording ? activeRecordings.get(roomId) : null,
      historyCount: completedRecordings.filter((r) => r.roomId === roomId).length,
    };
  },

  /**
   * List all historical recordings
   */
  getRecordingHistory(roomId = null) {
    if (roomId) {
      return completedRecordings.filter((r) => r.roomId === roomId);
    }
    return completedRecordings;
  },

  /**
   * Reset recording memory (for test isolation)
   */
  reset() {
    activeRecordings.clear();
    completedRecordings.length = 0;
  },
};
