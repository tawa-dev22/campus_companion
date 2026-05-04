import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { authenticator } = require('otplib');
import crypto from 'crypto';

class OTPService {
  constructor() {
    // Note: authenticator from otplib might be a default export in some ESM environments
    // or requires a specific subpath. If the direct import fails, we use a fallback.
  }

  generateOTP() {
    // Generate a cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60000);
    return { otp, expiresAt };
  }

  verifyOTP(userOTP, storedOTP, expiresAt) {
    if (!storedOTP || !expiresAt) return false;
    
    const now = new Date();
    if (now > expiresAt) return false;
    
    // Constant time comparison is better for security
    try {
      return crypto.timingSafeEqual(Buffer.from(userOTP), Buffer.from(storedOTP));
    } catch (e) {
      return userOTP === storedOTP;
    }
  }
}

export default new OTPService();
