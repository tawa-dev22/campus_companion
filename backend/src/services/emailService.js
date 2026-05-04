import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConnected = false;
  }

  ensureTransporter() {
    if (this.transporter) return;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async verifyConnection() {
    try {
      this.ensureTransporter();
      await this.transporter.verify();
      this.isConnected = true;
      logger.info('SMTP connection verified successfully');
    } catch (error) {
      this.isConnected = false;
      logger.warn('SMTP Connection failed. Falling back to development mode logging.');
      logger.warn(`Reason: ${error.message}`);
    }
  }

  async sendEmail({ to, subject, html }) {
    if (!this.isConnected) {
      logger.info('--- DEVELOPMENT EMAIL Fallback ---');
      logger.info(`To: ${to}`);
      logger.info(`Subject: ${subject}`);
      
      // Extract OTP if possible for easier debugging in console
      const otpMatch = html.match(/>(\d{4,6})<\/h1>/);
      const extractedOTP = otpMatch ? otpMatch[1] : 'Not Found';
      
      logger.warn(`OTP DETECTED: [ ${extractedOTP} ]`);
      logger.info('Body: (See logs for full HTML if needed)');
      logger.debug(html);
      logger.info('---------------------------------');
      return { messageId: 'dev-mode-fallback-' + Date.now() };
    }

    try {
      this.ensureTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error.message);
      throw new Error('Failed to send email');
    }
  }

  // Templates
  async sendOTPEmail(email, otp, name) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-bottom: 24px;">Verify Your Account</h2>
        <p style="color: #475569; font-size: 16px;">Hello ${name},</p>
        <p style="color: #475569; font-size: 16px;">Use the following code to verify your Campus Companion account. This code is valid for ${process.env.OTP_EXPIRES_MINUTES} minutes.</p>
        <div style="background: #f8fafc; padding: 24px; border-radius: 8px; text-align: center; margin: 32px 0;">
          <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 4px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: 'Account Verification - Campus Companion', html });
  }

  async sendPasswordResetEmail(email, otp, name) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-bottom: 24px;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 16px;">Hello ${name},</p>
        <p style="color: #475569; font-size: 16px;">We received a request to reset your password. Use the code below to proceed. This code is valid for ${process.env.OTP_EXPIRES_MINUTES} minutes.</p>
        <div style="background: #f8fafc; padding: 24px; border-radius: 8px; text-align: center; margin: 32px 0;">
          <h1 style="color: #e11d48; font-size: 36px; letter-spacing: 4px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: 'Password Reset - Campus Companion', html });
  }
}

export default new EmailService();
