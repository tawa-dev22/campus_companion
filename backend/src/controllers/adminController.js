import User from '../models/User.js';
import Role from '../models/Role.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Fetch all users in the system (System Administrator only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('role')
      .select('-password -otp -refreshToken');
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all available roles in the system
 */
export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    res.status(200).json({
      status: 'success',
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user details/role/status (System Administrator only)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, email, roleId, phone, isActive } = req.body;

    const user = await User.findById(id).populate('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Safety check: prevent a user from deactivating or changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      if (isActive === false) {
        return res.status(400).json({ message: 'You cannot deactivate your own account.' });
      }
      if (roleId && roleId !== user.role._id.toString()) {
        return res.status(400).json({ message: 'You cannot change your own role.' });
      }
    }

    const updatedFields = {};

    if (fullName) {
      user.fullName = fullName;
      updatedFields.fullName = fullName;
    }
    if (email) {
      user.email = email;
      updatedFields.email = email;
    }
    if (phone !== undefined) {
      user.phone = phone;
      updatedFields.phone = phone;
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
      updatedFields.isActive = isActive;
    }

    if (roleId) {
      const targetRole = await Role.findById(roleId);
      if (!targetRole) {
        return res.status(400).json({ message: 'Role does not exist.' });
      }
      user.role = targetRole._id;
      updatedFields.role = targetRole.name;
    }

    await user.save();

    // Log the update audit trail
    await logAudit(
      'USER_UPDATE_ADMIN',
      'USER_MANAGEMENT',
      req.user._id,
      { targetUserId: user._id, updatedFields },
      req
    );

    const populatedUser = await User.findById(id).populate('role').select('-password');

    res.status(200).json({
      status: 'success',
      data: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user from the system (System Administrator only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Safety check: prevent user from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    await User.findByIdAndDelete(id);

    // Log the delete audit trail
    await logAudit(
      'USER_DELETE_ADMIN',
      'USER_MANAGEMENT',
      req.user._id,
      { targetUserId: id, targetUserEmail: user.email, targetUserFullName: user.fullName },
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
