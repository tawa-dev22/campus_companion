import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { AppError } from './errorHandler.js';
import logger from '../config/logger.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findRoleFromStoredValue = async (storedRole) => {
  if (!storedRole) {
    return null;
  }

  if (typeof storedRole === 'string') {
    return Role.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(storedRole.trim())}$`, 'i') },
    }).populate('permissions');
  }

  return Role.findById(storedRole).populate('permissions');
};

const resolveUserRole = async (user) => {
  const currentRole = user.role;

  if (currentRole.name && Array.isArray(currentRole.permissions)) {
    return currentRole;
  }

  if (!currentRole) {
    const rawUser = await User.collection.findOne(
      { _id: user._id },
      { projection: { role: 1 } }
    );
    const resolvedRole = await findRoleFromStoredValue(rawUser?.role);

    if (resolvedRole && typeof rawUser?.role === 'string') {
      await User.updateOne({ _id: user._id }, { $set: { role: resolvedRole._id } });
    }

    return resolvedRole;
  }

  const resolvedRole = await findRoleFromStoredValue(currentRole._id || currentRole);

  if (resolvedRole && typeof currentRole === 'string') {
    await User.updateOne({ _id: user._id }, { $set: { role: resolvedRole._id } });
  }

  return resolvedRole;
};

export const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).populate('role');

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('This user account is inactive. Please contact administrator.', 403));
    }

    const role = await resolveUserRole(user);
    if (!role) {
      logger.warn(`User ${user.email} is missing a valid role assignment.`);
      return next(new AppError('This account is missing a valid role. Please contact administrator.', 403));
    }

    // Attach user to request
    user.role = role;
    req.user = user;
    
    // Flatten permissions for easier checking
    req.permissions = Array.isArray(role.permissions) ? role.permissions.map((permission) => permission.name) : [];
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

/**
 * Authorize middleware to check for specific permission
 * @param {string} requiredPermission 
 */
export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    // System Administrator bypasses all permission checks
    if (req.user?.role?.name === 'System Administrator') {
      return next();
    }

    if (!req.permissions.includes(requiredPermission)) {
      logger.warn(`User ${req.user.email} attempted unauthorized access to ${req.originalUrl} - Required: ${requiredPermission}`);
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
