import { User } from '../models/User.js';

export const updateProfile = async (req, res, next) => {
  try {
    if (req.user.isGuest) {
      return res.json({
        success: true,
        user: { ...req.user, ...req.body },
        message: 'Guest profile updated for session',
      });
    }

    const { displayName, avatarColor, avatarShape, statusMessage } = req.body;
    const updates = {};
    if (displayName) updates.displayName = displayName.trim();
    if (avatarColor) updates.avatarColor = avatarColor;
    if (avatarShape) updates.avatarShape = avatarShape;
    if (statusMessage) updates.statusMessage = statusMessage.trim();

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};
