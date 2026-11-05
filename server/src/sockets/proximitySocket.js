import { calculateHaversineDistance, isValidCoordinate } from "../utils/distance.js";
import { OfficeLayout } from "../models/OfficeLayout.js";
import { getEligibleChatRecipients, createSpatialMessage } from "../services/spatialChatService.js";
import { roomModerationService } from "../services/roomModerationService.js";
import { meshDiagnosticsService } from "../services/meshDiagnosticsService.js";

// In-memory registry of live active colleagues in the office
const liveUsers = new Map();

// Track active earshot pairs: key `${min(id1, id2)}:${max(id1, id2)}`
const activeEarshotPairs = new Set();

const DEFAULT_EARSHOT_RADIUS = 160; // pixels

function getPairKey(id1, id2) {
  return id1 < id2 ? `${id1}:${id2}` : `${id2}:${id1}`;
}

function getActiveOfficePeers(excludeSocketId) {
  const list = [];
  for (const [id, u] of liveUsers.entries()) {
    if (id !== excludeSocketId && u.x !== null && u.y !== null) {
      list.push({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        x: u.x,
        y: u.y,
        zone: u.zone,
        isSpeaking: !!u.isSpeaking,
      });
    }
  }
  return list;
}

export function setupProximitySocket(io) {
  // Background periodic peer synchronization
  const peerSyncInterval = setInterval(() => {
    if (liveUsers.size > 0) {
      for (const [id] of liveUsers.entries()) {
        const s = io.sockets.sockets.get(id);
        if (s) {
          s.emit("office:users", getActiveOfficePeers(id));
        }
      }
    }
  }, 2500);

  io.on("connection", (socket) => {
    const spawnCount = liveUsers.size;
    const spawnOffsetX = ((spawnCount * 53) % 160) - 80;
    const spawnOffsetY = ((spawnCount * 37) % 100) - 50;

    const user = {
      id: socket.id,
      name: `Colleague-${socket.id.slice(0, 4)}`,
      x: 220 + spawnOffsetX, // Distributed spawn position around Lobby
      y: 190 + spawnOffsetY,
      zone: "Modern Reception Lobby",
      latitude: null,
      longitude: null,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${socket.id}`,
      isSpeaking: false,
      joinedAt: new Date(),
    };

    liveUsers.set(socket.id, user);

    // Send active live users count
    io.emit("live:count", liveUsers.size);

    // Send existing peers in the office floor plan to the newly connected user
    socket.emit("office:users", getActiveOfficePeers(socket.id));

    // Announce the new user to all existing clients
    socket.broadcast.emit("user:joined", {
      id: socket.id,
      name: user.name,
      avatar: user.avatar,
      x: user.x,
      y: user.y,
      zone: user.zone,
      isSpeaking: false,
    });

    /**
     * Request current office peers list
     */
    socket.on("office:sync", () => {
      socket.emit("office:users", getActiveOfficePeers(socket.id));
    });

    /**
     * User identifies with their logged-in profile
     */
    socket.on("user:identify", (profile) => {
      if (profile && profile.name) {
        user.name = profile.name;
        if (profile.avatar) user.avatar = profile.avatar;
        if (profile.id) user.userId = profile.id;
        socket.broadcast.emit("user:joined", {
          id: socket.id,
          name: user.name,
          avatar: user.avatar,
          x: user.x,
          y: user.y,
          zone: user.zone,
          isSpeaking: !!user.isSpeaking,
        });
        socket.emit("office:users", getActiveOfficePeers(socket.id));
      }
    });

    /**
     * Colleague moves across the virtual office floor plan
     * Evaluates spatial clustering under 20ms and triggers WebRTC earshot handshakes
     */
    socket.on("user:move", (pos) => {
      if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) {
        return;
      }

      const startTime = performance.now();

      user.x = Math.round(pos.x);
      user.y = Math.round(pos.y);
      if (pos.zone) user.zone = pos.zone;
      const earshotRadius = Number(pos.radius) || DEFAULT_EARSHOT_RADIUS;

      const nearbyPeers = [];

      for (const [otherId, other] of liveUsers.entries()) {
        if (otherId === socket.id) continue;
        if (other.x === null || other.y === null) continue;

        const dist = Math.round(Math.hypot(user.x - other.x, user.y - other.y));
        const occlusion = OfficeLayout.calculateOcclusion(user.x, user.y, other.x, other.y);
        const pairKey = getPairKey(socket.id, otherId);

        // Within earshot radius: WebRTC peer connection is established
        if (dist <= earshotRadius) {
          nearbyPeers.push({
            id: other.id,
            name: other.name,
            avatar: other.avatar,
            x: other.x,
            y: other.y,
            zone: other.zone,
            distance: dist,
            occlusion,
            isSpeaking: other.isSpeaking,
          });

          if (!activeEarshotPairs.has(pairKey)) {
            activeEarshotPairs.add(pairKey);

            // Inform current user that other peer entered earshot
            socket.emit("webrtc:peer-in-range", {
              peerId: other.id,
              name: other.name,
              avatar: other.avatar,
              distance: dist,
              occlusion,
              x: other.x,
              y: other.y,
            });

            // Inform other peer that current user entered earshot
            io.to(other.id).emit("webrtc:peer-in-range", {
              peerId: socket.id,
              name: user.name,
              avatar: user.avatar,
              distance: dist,
              occlusion,
              x: user.x,
              y: user.y,
            });
          } else {
            // Send dynamic distance update for spatial audio attenuation
            socket.emit("webrtc:distance-update", {
              peerId: other.id,
              distance: dist,
              occlusion,
              dx: other.x - user.x,
              dy: other.y - user.y,
            });
            io.to(other.id).emit("webrtc:distance-update", {
              peerId: socket.id,
              distance: dist,
              occlusion,
              dx: user.x - other.x,
              dy: user.y - other.y,
            });
          }
        } else {
          // Beyond earshot radius: WebRTC peer connection is closed
          if (activeEarshotPairs.has(pairKey)) {
            activeEarshotPairs.delete(pairKey);

            socket.emit("webrtc:peer-out-of-range", { peerId: other.id });
            io.to(other.id).emit("webrtc:peer-out-of-range", { peerId: socket.id });
          }
        }
      }

      const clusteringTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

      socket.emit("proximity:peers", nearbyPeers);
      socket.emit("proximity:audit", {
        peersCount: nearbyPeers.length,
        executionMs: clusteringTimeMs,
        under20msBenchmark: clusteringTimeMs < 20,
      });

      // Broadcast position update to other colleagues
      socket.broadcast.emit("peer:moved", {
        id: socket.id,
        name: user.name,
        avatar: user.avatar,
        x: user.x,
        y: user.y,
        zone: user.zone,
        isSpeaking: !!user.isSpeaking,
      });
    });

    /**
     * WebRTC P2P Signaling Relay (Offers, Answers, ICE Candidates)
     */
    socket.on("webrtc:signal", ({ to, signal }) => {
      if (to && signal) {
        io.to(to).emit("webrtc:signal", {
          from: socket.id,
          fromName: user.name,
          fromAvatar: user.avatar,
          signal,
        });
      }
    });

    socket.on("webrtc:offer", ({ to, offer }) => {
      if (to && offer) {
        io.to(to).emit("webrtc:offer", {
          from: socket.id,
          fromName: user.name,
          offer,
        });
      }
    });

    socket.on("webrtc:answer", ({ to, answer }) => {
      if (to && answer) {
        io.to(to).emit("webrtc:answer", {
          from: socket.id,
          answer,
        });
      }
    });

    socket.on("webrtc:ice-candidate", ({ to, candidate }) => {
      if (to && candidate) {
        io.to(to).emit("webrtc:ice-candidate", {
          from: socket.id,
          candidate,
        });
      }
    });

    /**
     * Live Microphone Speaking Indicator Broadcast
     */
    socket.on("user:speaking", ({ isSpeaking, level = 0 }) => {
      user.isSpeaking = !!isSpeaking;
      socket.broadcast.emit("peer:speaking", {
        id: socket.id,
        isSpeaking: !!isSpeaking,
        level: Math.round(level * 100) / 100,
      });
    });

    /**
     * GPS Location Handler (Backward compatibility)
     */
    socket.on("user:location", (coords) => {
      if (!coords || !isValidCoordinate(coords.latitude, coords.longitude)) {
        return;
      }

      user.latitude = Number(coords.latitude);
      user.longitude = Number(coords.longitude);

      const nearbyPeers = [];
      for (const [otherId, other] of liveUsers.entries()) {
        if (otherId === socket.id) continue;
        if (other.latitude === null || other.longitude === null) continue;

        const distanceMeters = calculateHaversineDistance(
          user.latitude,
          user.longitude,
          other.latitude,
          other.longitude
        );

        if (distanceMeters <= 1000) {
          nearbyPeers.push({
            id: other.id,
            name: other.name,
            avatar: other.avatar,
            latitude: other.latitude,
            longitude: other.longitude,
            distance: distanceMeters,
          });
        }
      }

      socket.emit("proximity:peers", nearbyPeers);
      socket.broadcast.emit("peer:moved", {
        id: socket.id,
        name: user.name,
        avatar: user.avatar,
        latitude: user.latitude,
        longitude: user.longitude,
      });
    });

    /**
     * Disconnect Cleanup: Sever all WebRTC connections for departing user
     */

    /**
     * Week 4: Ephemeral Spatial Proximity Chat
     */
    socket.on("chat:send", async (data = {}) => {
      try {
        const { content, radius = DEFAULT_EARSHOT_RADIUS, isBroadcast = false } = data;
        if (!content || typeof content !== "string" || !content.trim()) return;

        const isRoomLocked = roomModerationService.getStatus(user.zone)?.isLocked || false;
        const eligiblePeers = getEligibleChatRecipients({
          sender: user,
          peers: Array.from(liveUsers.values()),
          radius,
          isRoomLocked,
        });

        const savedMsg = await createSpatialMessage({
          senderId: socket.id,
          senderName: user.name,
          senderAvatar: user.avatar,
          x: user.x,
          y: user.y,
          zone: user.zone,
          radius,
          content: content.trim(),
          isRoomLocked,
          isBroadcast,
        });

        socket.emit("chat:message", {
          ...savedMsg,
          distance: 0,
          isSelf: true,
        });

        for (const peer of eligiblePeers) {
          io.to(peer.id).emit("chat:message", {
            ...savedMsg,
            distance: peer.distance,
            isSelf: false,
          });
        }
      } catch (err) {
        console.error("[SpatialChat] Error relaying message:", err);
      }
    });

    /**
     * Week 4: Room Moderation & Host Governance
     */
    socket.on("room:claim-host", ({ roomId } = {}) => {
      const roomTarget = roomId || user.zone;
      const res = roomModerationService.claimHost(roomTarget, socket.id, user.name);
      socket.emit("room:host-updated", res);
    });

    socket.on("room:mute-all", ({ roomId } = {}) => {
      try {
        const roomTarget = roomId || user.zone;
        const roomPeers = Array.from(liveUsers.values()).filter(u => u.zone === roomTarget);
        const res = roomModerationService.muteAllParticipants(roomTarget, socket.id, roomPeers);
        for (const peerId of res.mutedPeerIds) {
          io.to(peerId).emit("room:force-mute", { hostId: socket.id, hostName: user.name, roomId: roomTarget });
        }
        socket.emit("room:moderation-status", res);
      } catch (err) {
        socket.emit("room:error", { message: err.message });
      }
    });

    socket.on("room:kick", ({ roomId, targetPeerId } = {}) => {
      try {
        const roomTarget = roomId || user.zone;
        const res = roomModerationService.kickParticipant(roomTarget, socket.id, targetPeerId);
        io.to(targetPeerId).emit("room:kicked", {
          message: 'You were ejected from ' + roomTarget + ' by ' + user.name + '.',
          relocateTo: res.relocateTo,
        });
        const kickedUser = liveUsers.get(targetPeerId);
        if (kickedUser) {
          kickedUser.x = res.relocateTo.x;
          kickedUser.y = res.relocateTo.y;
          kickedUser.zone = res.relocateTo.zone;
          io.emit("peer:moved", kickedUser);
        }
        socket.emit("room:moderation-status", res);
      } catch (err) {
        socket.emit("room:error", { message: err.message });
      }
    });

    socket.on("room:toggle-lock", ({ roomId } = {}) => {
      try {
        const roomTarget = roomId || user.zone;
        const res = roomModerationService.toggleRoomLock(roomTarget, socket.id);
        io.emit("room:lock-status", res);
      } catch (err) {
        socket.emit("room:error", { message: err.message });
      }
    });

    /**
     * Week 4: Mesh Diagnostics Telemetry
     */
    socket.on("mesh:telemetry", (data = {}) => {
      if (!data.toId) return;
      const telemetryRecord = meshDiagnosticsService.recordPeerTelemetry({
        fromId: socket.id,
        toId: data.toId,
        rttMs: data.rttMs,
        jitterMs: data.jitterMs,
        packetLoss: data.packetLoss,
        bitrateKbps: data.bitrateKbps,
        zone: user.zone,
      });
      socket.emit("mesh:telemetry-ack", telemetryRecord);
    });

    socket.on("disconnect", () => {
      liveUsers.delete(socket.id);

      // Clean up all active earshot pairs
      for (const pair of Array.from(activeEarshotPairs)) {
        if (pair.includes(socket.id)) {
          activeEarshotPairs.delete(pair);
          const [idA, idB] = pair.split(":");
          const otherId = idA === socket.id ? idB : idA;
          io.to(otherId).emit("webrtc:peer-out-of-range", { peerId: socket.id });
        }
      }

      io.emit("live:count", liveUsers.size);
      io.emit("user:left", socket.id);
    });
  });
}
