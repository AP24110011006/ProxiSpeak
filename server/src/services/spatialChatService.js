/**
 * ProxiSpeak Week 4 — Spatial Chat & In-Earshot Messaging Service
 * Author: Koneti Manikanth <manikanth9878@gmail.com>
 *
 * Implements real-time proximity-bounded text chat with acoustic isolation boundaries.
 * Messages are only delivered to coworkers physically within hearing range or inside
 * the same confidential acoustic meeting room.
 */

import mongoose from "mongoose";
import { SpatialMessage } from "../models/SpatialMessage.js";

// In-memory fallback buffer for offline testing
const inMemoryMessages = [];

// Corporate soundproof rooms on Floor 4
const SOUNDPROOF_ZONES = [
  "Executive Glass Boardroom",
  "Focus Cabin Alpha",
  "Focus Cabin Beta",
];

export function isSoundproofZone(zoneName) {
  if (!zoneName) return false;
  return SOUNDPROOF_ZONES.some((z) =>
    zoneName.toLowerCase().includes(z.toLowerCase())
  );
}

/**
 * Filter peers eligible to receive the spatial message based on acoustic geometry
 */
export function getEligibleChatRecipients({
  sender,
  peers,
  radius = 160,
  isRoomLocked = false,
}) {
  const recipients = [];

  const senderIsSoundproof = isSoundproofZone(sender.zone);

  for (const peer of peers) {
    if (peer.id === sender.id) continue;
    if (peer.x === undefined || peer.y === undefined) continue;

    const peerIsSoundproof = isSoundproofZone(peer.zone);

    // Case 1: Sender is inside a locked soundproof room
    if (senderIsSoundproof && isRoomLocked) {
      // Must be in the exact same room
      if (peer.zone === sender.zone) {
        const dist = Math.hypot(peer.x - sender.x, peer.y - sender.y);
        recipients.push({ ...peer, distance: Math.round(dist) });
      }
      continue;
    }

    // Case 2: Peer is inside a locked soundproof room while sender is outside
    if (peerIsSoundproof && peer.isRoomLocked) {
      // Soundproof wall prevents message leakage
      continue;
    }

    // Case 3: Standard open floor proximity evaluation
    const dist = Math.hypot(peer.x - sender.x, peer.y - sender.y);
    if (dist <= radius) {
      recipients.push({
        ...peer,
        distance: Math.round(dist),
      });
    }
  }

  return recipients;
}

/**
 * Persist and prepare spatial message envelope
 */
export async function createSpatialMessage({
  senderId,
  senderName,
  senderAvatar,
  x,
  y,
  zone,
  radius = 160,
  content,
  isRoomLocked = false,
  isBroadcast = false,
}) {
  const msgData = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    senderId,
    senderName,
    senderAvatar:
      senderAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${senderId}`,
    x,
    y,
    zone,
    radius,
    content: content.trim(),
    isRoomLocked,
    isBroadcast,
    createdAt: new Date(),
  };

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const doc = await SpatialMessage.create(msgData);
      return doc.toObject();
    } catch (err) {
      // Fallback to in-memory store
      inMemoryMessages.unshift(msgData);
      if (inMemoryMessages.length > 50) inMemoryMessages.pop();
      return msgData;
    }
  } else {
    inMemoryMessages.unshift(msgData);
    if (inMemoryMessages.length > 50) inMemoryMessages.pop();
    return msgData;
  }
}

/**
 * Retrieve recent spatial messages for a given location and earshot
 */
export async function getRecentNearbyMessages({ x, y, radius = 160, zone }) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const list = await SpatialMessage.find({
        createdAt: { $gte: new Date(Date.now() - 600 * 1000) },
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

      return list.filter((m) => {
        if (isSoundproofZone(m.zone) && m.isRoomLocked) {
          return m.zone === zone;
        }
        return Math.hypot(m.x - x, m.y - y) <= Math.max(radius, m.radius);
      });
    } catch (err) {
      // fallback
    }
  }

  return inMemoryMessages.filter((m) => {
    if (isSoundproofZone(m.zone) && m.isRoomLocked) {
      return m.zone === zone;
    }
    return Math.hypot(m.x - x, m.y - y) <= Math.max(radius, m.radius);
  });
}
