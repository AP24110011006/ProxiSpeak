import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'proxispeak_super_secret_jwt_key_2026_dev';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      role: user.role || 'user',
      isGuest: Boolean(user.isGuest),
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Express middleware for HTTP requests
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = verifyToken(token);

    if (decoded.isGuest) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        username: decoded.username,
        displayName: decoded.displayName,
        isGuest: true,
      };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

/**
 * Socket.io middleware for WebSocket handshakes
 */
export const socketAuthenticate = (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) {
      // Allow guest session generation if explicitly requested
      const guestName = socket.handshake.auth?.guestName || socket.handshake.query?.guestName;
      if (guestName) {
        socket.user = {
          id: `guest_${socket.id.substring(0, 6)}`,
          username: guestName,
          displayName: guestName,
          avatarColor: socket.handshake.auth?.avatarColor || '#10B981',
          isGuest: true,
        };
        return next();
      }
      return next(new Error('Authentication token missing'));
    }

    const decoded = verifyToken(token);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid socket credentials: ' + err.message));
  }
};
