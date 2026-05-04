import * as authService from '../services/authService.js';

const sendTokenResponse = (result, statusCode, res) => {
  const { user, accessToken, refreshToken } = result;
  
  // Set refresh token in httpOnly cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  user.password = undefined;
  user.refreshToken = undefined;
  user.otp = undefined;
  user.otpExpires = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: { user }
  });
};

export async function register(req, res, next) {
  try {
    await authService.registerUser(req.body, req);
    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email for verification code.'
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyRegistration(req, res, next) {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP(email, otp, req);
    sendTokenResponse(result, 200, res);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password, req);
    sendTokenResponse(result, 200, res);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authService.refreshAccessToken(token);
    sendTokenResponse({ user: req.user, ...result }, 200, res);
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email.'
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;
    await authService.resetPassword(email, otp, newPassword);
    res.status(200).json({
      status: 'success',
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logoutUser(req.user._id);
    res.clearCookie('refreshToken');
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    res.status(200).json({
      status: 'success',
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
}
