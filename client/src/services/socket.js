import { io } from "socket.io-client";

const SOCKET_URL =
  typeof window !== "undefined" && window.location.hostname
    ? `http://${window.location.hostname}:5000`
    : "http://localhost:5000";

let socket = null;
let lastMovePos = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log(`[Socket] Connected to ${SOCKET_URL} (ID: ${socket.id})`);
      if (lastMovePos) {
        socket.emit("user:move", lastMovePos);
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });
  }
  return socket;
}

export function identifySocketUser(profile) {
  const s = getSocket();
  if (s) {
    s.emit("user:identify", profile);
  }
}

export function emitLocation(latitude, longitude) {
  const s = getSocket();
  if (s) {
    s.emit("user:location", { latitude, longitude });
  }
}

export function emitOfficeMove(pos) {
  lastMovePos = pos;
  const s = getSocket();
  if (s) {
    s.emit("user:move", pos);
  }
}

