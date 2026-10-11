import {
  calculateEuclideanDistance,
  calculateDistanceAttenuation,
  calculateStereoPan,
  calculateObstacleDamping,
} from '../utils/distance.js';
import { User } from '../models/User.js';

export class ProximityService {
  constructor(defaultRadius = 100, buffer = 15) {
    this.defaultRadius = defaultRadius; // 100 pixels specified in Infotact document
    this.buffer = buffer; // 15 pixels hysteresis buffer (disconnects at 115px)
  }

  /**
   * High-performance in-memory proximity calculation for live movement ticks.
   * Compares the moving user against all other users in the same office.
   */
  calculateProximityDeltas({
    currentUser,
    otherUsers,
    previousNearbyIds = new Set(),
    obstacles = [],
    radius = this.defaultRadius,
  }) {
    const nearbyPeers = [];
    const enteredProximity = [];
    const exitedProximity = [];
    const currentNearbyIds = new Set();

    const disconnectRadius = radius + this.buffer;

    for (const peer of otherUsers) {
      if (peer.userId === currentUser.userId) continue;

      const dist = calculateEuclideanDistance(currentUser, peer);
      const isCurrentlyConnected = previousNearbyIds.has(peer.userId);

      // Check if within connect threshold or within hysteresis disconnect threshold
      const isNearby = isCurrentlyConnected ? dist <= disconnectRadius : dist <= radius;

      if (isNearby) {
        currentNearbyIds.add(peer.userId);

        // Calculate spatial audio parameters
        const baseAttenuation = calculateDistanceAttenuation(dist, radius);
        const obstacleFactor = calculateObstacleDamping(currentUser, peer, obstacles);
        const finalAttenuation = Number((baseAttenuation * obstacleFactor).toFixed(3));
        const pan = calculateStereoPan(currentUser, peer, radius);

        const peerInfo = {
          userId: peer.userId,
          socketId: peer.socketId,
          displayName: peer.displayName,
          distance: Math.round(dist * 10) / 10,
          attenuation: finalAttenuation,
          pan,
          isMuted: peer.isMuted,
          isSpeaking: peer.isSpeaking,
        };

        nearbyPeers.push(peerInfo);

        if (!isCurrentlyConnected) {
          enteredProximity.push(peerInfo);
        }
      } else {
        if (isCurrentlyConnected) {
          exitedProximity.push({
            userId: peer.userId,
            socketId: peer.socketId,
            distance: Math.round(dist * 10) / 10,
          });
        }
      }
    }

    return {
      nearbyPeers,
      enteredProximity,
      exitedProximity,
      currentNearbyIds,
    };
  }

  /**
   * MongoDB $near geospatial query on User collection
   * Searches for users geographically nearest to [x, y] in coordinates space.
   */
  async findNearbyUsersMongo(officeId, [x, y], maxDistance = this.defaultRadius) {
    const startTime = performance.now();
    try {
      const users = await User.find({
        isOnline: true,
        'lastPosition.officeId': officeId,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [x, y],
            },
            $maxDistance: maxDistance,
          },
        },
      })
        .select('username displayName avatarColor lastPosition location isOnline')
        .limit(50)
        .lean();

      const executionTimeMs = performance.now() - startTime;
      return { users, executionTimeMs };
    } catch (error) {
      // Return fallback empty if DB query fails or index isn't built yet
      const executionTimeMs = performance.now() - startTime;
      return { users: [], executionTimeMs, error: error.message };
    }
  }

  /**
   * MongoDB $geoWithin query to find users within a designated bounding box / room
   */
  async findUsersInRoomMongo(officeId, [minX, minY], [maxX, maxY]) {
    const startTime = performance.now();
    try {
      const users = await User.find({
        isOnline: true,
        'lastPosition.officeId': officeId,
        location: {
          $geoWithin: {
            $box: [
              [minX, minY],
              [maxX, maxY],
            ],
          },
        },
      })
        .select('username displayName avatarColor lastPosition')
        .lean();

      const executionTimeMs = performance.now() - startTime;
      return { users, executionTimeMs };
    } catch (error) {
      const executionTimeMs = performance.now() - startTime;
      return { users: [], executionTimeMs, error: error.message };
    }
  }

  /**
   * Performance benchmark validating that geospatial proximity evaluation
   * handles 50+ concurrent users well under 20ms (Mid-Project Review specification).
   */
  benchmarkInMomoryProximity(userCount = 50) {
    const mockUsers = [];
    for (let i = 0; i < userCount; i++) {
      mockUsers.push({
        userId: `user_${i}`,
        socketId: `socket_${i}`,
        x: Math.random() * 1200,
        y: Math.random() * 800,
        isMuted: false,
        isSpeaking: false,
      });
    }

    const testSubject = {
      userId: 'test_subject',
      socketId: 'socket_test',
      x: 600,
      y: 400,
    };

    const startTime = performance.now();
    const result = this.calculateProximityDeltas({
      currentUser: testSubject,
      otherUsers: mockUsers,
      radius: this.defaultRadius,
    });
    const executionTimeMs = performance.now() - startTime;

    return {
      userCount,
      executionTimeMs,
      under20msTarget: executionTimeMs < 20,
      nearbyFound: result.nearbyPeers.length,
    };
  }
}

export const proximityService = new ProximityService(
  Number(process.env.PROXIMITY_RADIUS) || 100,
  Number(process.env.PROXIMITY_BUFFER) || 15
);
