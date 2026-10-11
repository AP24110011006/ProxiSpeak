import { User } from '../models/User.js';
import { generateToken } from '../middleware/authenticate.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName, avatarColor, avatarShape } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username or email already in use' });
    }

    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      displayName: displayName?.trim() || username.trim(),
      avatarColor: avatarColor || '#3B82F6',
      avatarShape: avatarShape || 'circle',
    });

    await user.save();
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials' });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase().trim() },
        { username: emailOrUsername.trim() },
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const guestLogin = async (req, res, next) => {
  try {
    const { displayName, avatarColor } = req.body;
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
    const guestUser = {
      _id: guestId,
      id: guestId,
      username: displayName ? displayName.trim() : `Guest_${guestId.substring(6)}`,
      displayName: displayName ? displayName.trim() : `Guest ${guestId.substring(6)}`,
      avatarColor: avatarColor || '#10B981',
      avatarShape: 'circle',
      isGuest: true,
    };

    const token = generateToken(guestUser);
    res.json({
      success: true,
      token,
      user: guestUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (req.user.isGuest) {
      return res.json({ success: true, user: req.user });
    }
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
