import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAudit } from '../utils/auditLogger.js';
import emailService from './emailService.js';
import otpService from './otpService.js';
import { generateTokens } from '../utils/tokenUtils.js';

export const registerUser = async (userData, req) => {
  const { fullName, email, password, studentId, department } = userData;

  const existingUser = await User.findOne({ email });
  const studentRole = await Role.findOne({ name: 'Student' });
  if (!studentRole) {
    throw new AppError('Default role not found. Please contact administrator.', 500);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const { otp, expiresAt } = otpService.generateOTP();

  let newUser;

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new AppError('Email already in use', 400);
    }
    // Update existing unverified user with new OTP and details
    existingUser.fullName = fullName;
    existingUser.password = hashedPassword;
    existingUser.studentId = studentId;
    existingUser.department = department;
    existingUser.otp = otp;
    existingUser.otpExpires = expiresAt;
    await existingUser.save();
    newUser = existingUser;
  } else {
    newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      studentId,
      department,
      role: studentRole._id,
      otp,
      otpExpires: expiresAt,
      isVerified: false,
      isActive: true,
    });
  }

  // Send OTP Email safely
  try {
    await emailService.sendOTPEmail(email, otp, fullName);
  } catch (error) {
    // If email strictly fails, fallback to logging the OTP so the user isn't stuck completely
    console.error('Email failed to send. Developer Fallback OTP:', otp);
    // Depending on strictness, we could throw here, but let's let them retry or check DEV console.
    throw new AppError('Failed to send verification email. Please try a different email or try again later.', 500);
  }
  
  await logAudit('USER_REGISTERED', 'auth', newUser._id, { email: newUser.email }, req);

  return newUser;
};

export const verifyOTP = async (email, otp, req) => {
  const user = await User.findOne({ email }).populate('role');
  if (!user) throw new AppError('User not found', 404);

  const isValid = otpService.verifyOTP(otp, user.otp, user.otpExpires);
  if (!isValid) throw new AppError('Invalid or expired OTP', 400);

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken; // Normally hashed in DB for extra security
  await user.save();

  await logAudit('OTP_VERIFIED', 'auth', user._id, {}, req);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (email, password, req) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password').populate('role');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email to login', 403);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  
  user.refreshToken = refreshToken;
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await logAudit('USER_LOGIN', 'auth', user._id, {}, req);

  return { user, accessToken, refreshToken };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const refreshAccessToken = async (token) => {
  const user = await User.findOne({ refreshToken: token }).populate('role');
  if (!user) throw new AppError('Invalid refresh token', 401);

  const { accessToken, refreshToken } = generateTokens(user._id);
  
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('User with this email does not exist', 404);

  const { otp, expiresAt } = otpService.generateOTP();
  user.otp = otp;
  user.otpExpires = expiresAt;
  await user.save();

  await emailService.sendPasswordResetEmail(email, otp, user.fullName);
};

export const resetPassword = async (email, otp, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('User not found', 404);

  const isValid = otpService.verifyOTP(otp, user.otp, user.otpExpires);
  if (!isValid) throw new AppError('Invalid or expired OTP', 400);

  user.password = await bcrypt.hash(newPassword, 12);
  user.otp = undefined;
  user.otpExpires = undefined;
  user.refreshToken = null; // Invalidate all sessions on password change
  await user.save();

  await logAudit('PASSWORD_RESET_SUCCESS', 'auth', user._id, {}, null);
};
