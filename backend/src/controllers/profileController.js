import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('role');
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
};

/**
 * Get any user's public profile info
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('fullName email profilePicture department role');
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile information
 */
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'fullName', 'phone', 'gender', 'dateOfBirth', 
      'address', 'bio', 'studentId', 'staffId', 
      'department', 'program', 'level'
    ];
    
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('role');

    await logAudit('PROFILE_UPDATE', 'users', req.user._id, { fields: Object.keys(updateData) }, req);

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    const user = await User.findById(req.user._id).select('+password');
    
    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrect) {
      return next(new AppError('Current password is incorrect', 401));
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    await logAudit('PASSWORD_CHANGE', 'auth', user._id, {}, req);

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile picture
 */
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }

    const avatarUrl = `/uploads/profiles/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePicture: avatarUrl } },
      { new: true }
    ).populate('role');

    await logAudit('AVATAR_UPDATE', 'users', user._id, { avatarUrl }, req);

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};
