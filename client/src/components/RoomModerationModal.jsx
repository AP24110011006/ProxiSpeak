import React, { useState } from "react";
import {
  ShieldCheck,
  X,
  MicOff,
  UserX,
  Lock,
  Unlock,
  Users,
  Crown,
  VolumeX,
  History,
} from "lucide-react";

/**
 * ProxiSpeak Week 4 — Room Moderation & Host Governance Modal
 * Author: Harshitha Rao <harshithar978@gmail.com>
 *
 * Provides meeting room hosts with administrative governance controls:
 * Mute All, soundproof privacy lock toggling, and attendee ejection.
 */
export function RoomModerationModal({
  isOpen,
  onClose,
  roomName = "Executive Glass Boardroom",
  isHost = true,
  hostName = "Lead Architect",
  isRoomLocked = true,
  attendees = [],
  onMuteAll,
  onMutePeer,
  onKickPeer,
  onToggleLock,
}) {
  const [activeTab, setActiveTab] = useState("roster"); // 'roster' | 'audit'

  if (!isOpen) return null;

  return (
    <div className="moderation-modal-overlay">
      <div className="moderation-modal-container">
        {/* Header Bar */}
        <div className="moderation-header">
          <div className="moderation-title-wrap">
            <div className="moderation-icon-halo">
              <ShieldCheck size={20} className="text-indigo-400" />
            </div>
            <div>
              <div className="moderation-headline">
                <h3>Room Governance & Moderation</h3>
                {isRoomLocked && (
                  <span className="room-privacy-chip">
                    <Lock size={11} /> 95% Soundproof
                  </span>
                )}
              </div>
              <p className="moderation-subhead">
                {roomName} &bull; Host: <strong>{hostName}</strong> {isHost && "(You)"}
              </p>
            </div>
          </div>

          <button className="moderation-close-btn" onClick={onClose} title="Close Moderation Modal">
            <X size={18} />
          </button>
        </div>

        {/* Host Quick Actions Bar */}
        {isHost ? (
          <div className="moderation-actions-strip">
            <button
              className="host-action-btn mute-all"
              onClick={onMuteAll}
              title="Mute all attendees in this room"
            >
              <MicOff size={15} />
              <span>Mute All</span>
            </button>

            <button
              className={`host-action-btn ${isRoomLocked ? "locked" : "unlocked"}`}
              onClick={onToggleLock}
              title="Toggle soundproof privacy lock"
            >
              {isRoomLocked ? <Lock size={15} /> : <Unlock size={15} />}
              <span>{isRoomLocked ? "Soundproof Locked" : "Open Acoustics"}</span>
            </button>
          </div>
        ) : (
          <div className="non-host-banner">
            <Users size={14} />
            <span>You are viewing this room as an attendee. Only {hostName} can moderate.</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="moderation-tabs">
          <button
            className={`tab-btn ${activeTab === "roster" ? "active" : ""}`}
            onClick={() => setActiveTab("roster")}
          >
            <Users size={13} />
            <span>Room Attendees ({attendees.length})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "audit" ? "active" : ""}`}
            onClick={() => setActiveTab("audit")}
          >
            <History size={13} />
            <span>Governance Audit Log</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="moderation-body">
          {activeTab === "roster" ? (
            <div className="attendees-list">
              {attendees.map((attendee) => {
                const isThisHost = attendee.name === hostName;
                return (
                  <div key={attendee.id} className="attendee-row">
                    <div className="attendee-info">
                      <div className="attendee-avatar-wrap">
                        <img
                          src={
                            attendee.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${attendee.id}`
                          }
                          alt={attendee.name}
                          className="attendee-avatar"
                        />
                        {isThisHost && (
                          <span className="crown-badge" title="Room Host">
                            <Crown size={10} />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="attendee-name-wrap">
                          <strong className="attendee-name">{attendee.name}</strong>
                          <span className={`role-tag ${isThisHost ? "host" : "guest"}`}>
                            {isThisHost ? "Host" : "Participant"}
                          </span>
                        </div>
                        <span className="attendee-zone">{roomName}</span>
                      </div>
                    </div>

                    {isHost && !isThisHost && (
                      <div className="attendee-actions">
                        <button
                          className="action-icon-btn mute"
                          onClick={() => onMutePeer && onMutePeer(attendee.id)}
                          title={`Mute ${attendee.name}`}
                        >
                          <VolumeX size={14} />
                        </button>
                        <button
                          className="action-icon-btn kick"
                          onClick={() => onKickPeer && onKickPeer(attendee.id)}
                          title={`Eject ${attendee.name} from room`}
                        >
                          <UserX size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="audit-log-pane">
              <div className="audit-item">
                <span className="audit-time">10:32 AM</span>
                <span className="audit-desc">
                  <strong>Alice Lead</strong> claimed host role for {roomName}.
                </span>
              </div>
              <div className="audit-item">
                <span className="audit-time">10:34 AM</span>
                <span className="audit-desc">
                  <strong>Alice Lead</strong> activated 95% STC Soundproof Privacy Lock.
                </span>
              </div>
              <div className="audit-item">
                <span className="audit-time">10:35 AM</span>
                <span className="audit-desc">
                  <strong>Alice Lead</strong> executed Mute-All command across 3 participants.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
