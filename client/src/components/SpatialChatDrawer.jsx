import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Lock,
  Radio,
  Users,
  Compass,
  Smile,
  Shield,
} from "lucide-react";
import { getSocket } from "../services/socket.js";

/**
 * ProxiSpeak Week 4 — In-Earshot Spatial Chat Drawer
 * Author: Harshitha Rao <harshithar978@gmail.com>
 *
 * Implements real-time proximity-bounded text messaging.
 * Messages are rendered with acoustic distance attenuation badges and
 * confidential soundproof room isolation boundaries.
 */
export function SpatialChatDrawer({
  isOpen,
  onClose,
  currentZone = "Modern Reception Lobby",
  isRoomLocked = false,
  radius = 160,
  livePeers = [],
  currentUser = { name: "You", id: "self" },
  onSendMessage,
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      senderId: "system",
      senderName: "Acoustic System",
      senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=system",
      distance: 0,
      content: `Connected to Floor 4 proximity text mesh. Messages are audible within ${radius}px earshot.`,
      zone: currentZone,
      timestamp: "Just now",
      isSystem: true,
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef(null);

  // Filter peers currently in earshot
  const peersInEarshot = livePeers.filter((p) => p.inEarshot || p.distance <= radius);

  const isSoundproof =
    currentZone.toLowerCase().includes("boardroom") ||
    currentZone.toLowerCase().includes("focus cabin");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Real-time Socket listener for incoming in-earshot messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleIncoming = (incoming) => {
      if (!incoming) return;
      setMessages((prev) => {
        if (incoming.id && prev.some((m) => m.id === incoming.id)) {
          return prev;
        }
        return [
          ...prev,
          {
            id: incoming.id || `msg-${Date.now()}-${Math.random()}`,
            senderId: incoming.senderId,
            senderName: incoming.senderName || "Colleague",
            senderAvatar:
              incoming.senderAvatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${incoming.senderId || "peer"}`,
            distance: incoming.distance || 0,
            content: incoming.content,
            zone: incoming.zone || currentZone,
            timestamp:
              incoming.timestamp ||
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            isSelf:
              incoming.isSelf ||
              incoming.senderId === (currentUser.id || "self"),
          },
        ];
      });
    };

    socket.on("chat:message", handleIncoming);
    return () => {
      socket.off("chat:message", handleIncoming);
    };
  }, [currentUser.id, currentZone]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const text = inputVal.trim();
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id || "self",
      senderName: currentUser.name || "You",
      senderAvatar:
        currentUser.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=self",
      distance: 0,
      content: text,
      zone: currentZone,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (onSendMessage) {
      onSendMessage(text);
    }
    setInputVal("");
  };

  const addReaction = (emoji) => {
    setInputVal((prev) => prev + " " + emoji);
  };

  if (!isOpen) return null;

  return (
    <div className="spatial-chat-drawer-overlay" onClick={onClose}>
      <div className="spatial-chat-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="chat-drawer-header">
          <div className="header-title-wrap">
            <div className="chat-icon-halo">
              <MessageSquare size={18} className="text-indigo-400" />
            </div>
            <div>
              <div className="chat-headline-row">
                <h3>In-Earshot Workspace Chat</h3>
                {isSoundproof && isRoomLocked && (
                  <span className="room-locked-badge" title="Room Soundproof Isolated">
                    <Lock size={12} /> Confidential
                  </span>
                )}
              </div>
              <p className="chat-subhead">
                <Compass size={11} /> {currentZone} &bull;{" "}
                {isSoundproof && isRoomLocked
                  ? "Room Only"
                  : `${peersInEarshot.length} colleagues in earshot`}
              </p>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose} title="Close Chat Drawer">
            <X size={18} />
          </button>
        </div>

        {/* Acoustic Status Banner */}
        <div className="chat-acoustic-banner">
          <div className="banner-pill">
            <Radio size={12} />
            <span>Earshot Radius: {radius}px ({Math.round(radius / 10)}m)</span>
          </div>
          {isSoundproof ? (
            <div className="banner-pill privacy">
              <Shield size={12} />
              <span>{isRoomLocked ? "95% Wall Sound Isolation" : "Open Acoustics"}</span>
            </div>
          ) : (
            <div className="banner-pill listeners">
              <Users size={12} />
              <span>{peersInEarshot.length} Nearby Receivers</span>
            </div>
          )}
        </div>

        {/* Live Message Stream */}
        <div className="chat-messages-scroll">
          {messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="chat-system-message">
                  <span>{msg.content}</span>
                </div>
              );
            }

            const isSelf = msg.isSelf || msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`chat-message-bubble-row ${isSelf ? "self" : "peer"}`}
              >
                {!isSelf && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="chat-avatar"
                  />
                )}
                <div className="chat-bubble-content">
                  <div className="chat-meta-row">
                    <span className="chat-sender-name">{msg.senderName}</span>
                    {!isSelf && msg.distance > 0 && (
                      <span className="chat-distance-chip">
                        {Math.round(msg.distance / 10)}m away
                      </span>
                    )}
                    <span className="chat-time">{msg.timestamp}</span>
                  </div>
                  <div className={`chat-bubble ${isSelf ? "self-bubble" : "peer-bubble"}`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reactions Bar */}
        <div className="chat-reactions-strip">
          {["👍", "👏", "💡", "🚀", "❤️", "☕"].map((emoji) => (
            <button
              key={emoji}
              className="reaction-quick-btn"
              onClick={() => addReaction(emoji)}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-text-input"
            placeholder={
              isSoundproof && isRoomLocked
                ? `Whisper in ${currentZone}...`
                : `Say something to nearby colleagues (${Math.round(radius / 10)}m)...`
            }
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            maxLength={500}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputVal.trim()}
            title="Send in-earshot message"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
