/**
 * SignalingHandler: Relays WebRTC Offer, Answer, and ICE Candidates between peers
 */
export const registerSignalingHandlers = (io, socket) => {
  // Relay SDP offer to target peer
  socket.on('signal:offer', ({ toUserId, toSocketId, offer }) => {
    const targetSocket = toSocketId || io.sockets.sockets.get(toSocketId);
    if (toSocketId) {
      io.to(toSocketId).emit('signal:offer', {
        fromUserId: socket.user.id,
        fromSocketId: socket.id,
        fromDisplayName: socket.user.displayName,
        offer,
      });
    } else {
      socket.broadcast.emit('signal:offer', {
        fromUserId: socket.user.id,
        fromSocketId: socket.id,
        fromDisplayName: socket.user.displayName,
        toUserId,
        offer,
      });
    }
  });

  // Relay SDP answer to target peer
  socket.on('signal:answer', ({ toUserId, toSocketId, answer }) => {
    if (toSocketId) {
      io.to(toSocketId).emit('signal:answer', {
        fromUserId: socket.user.id,
        fromSocketId: socket.id,
        answer,
      });
    } else {
      socket.broadcast.emit('signal:answer', {
        fromUserId: socket.user.id,
        fromSocketId: socket.id,
        toUserId,
        answer,
      });
    }
  });

  // Relay ICE candidate to target peer
  socket.on('signal:ice-candidate', ({ toUserId, toSocketId, candidate }) => {
    if (candidate) {
      if (toSocketId) {
        io.to(toSocketId).emit('signal:ice-candidate', {
          fromUserId: socket.user.id,
          fromSocketId: socket.id,
          candidate,
        });
      } else {
        socket.broadcast.emit('signal:ice-candidate', {
          fromUserId: socket.user.id,
          fromSocketId: socket.id,
          toUserId,
          candidate,
        });
      }
    }
  });
};
