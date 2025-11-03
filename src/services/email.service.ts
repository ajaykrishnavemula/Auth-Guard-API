import nodemailer from 'nodemailer';
import config from '../config';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Email service for sending emails
 */
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  /**
   * Send an email
   * @param options Email options
   * @returns Promise<boolean> True if email was sent successfully
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || config.emailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error sending email: ${error.message}`);
      } else {
        logger.error('Unknown error sending email');
      }
      return false;
    }
  }

  /**
   * Send a verification email
   * @param to Recipient email
   * @param name Recipient name
   * @param token Verification token
   * @returns Promise<boolean> True if email was sent successfully
   */
  async sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Verify Your Email Address</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 5px;">
            Verify Email
          </a>
        </div>
        <p>If you did not create an account, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  /**
   * Send a password reset email
   * @param to Recipient email
   * @param name Recipient name
   * @param token Password reset token
   * @returns Promise<boolean> True if email was sent successfully
   */
  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Reset Your Password</h2>
        <p>Hello ${name},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 5px;">
            Reset Password
          </a>
        </div>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>This link will expire in 10 minutes.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Reset Your Password',
      html,
    });
  }

  /**
   * Send a two-factor authentication setup email
   * @param to Recipient email
   * @param name Recipient name
   * @param secret Two-factor authentication secret
   * @returns Promise<boolean> True if email was sent successfully
   */
  async sendTwoFactorSetupEmail(to: string, name: string, secret: string): Promise<boolean> {
    const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/Auth-Service:${to}?secret=${secret}&issuer=Auth-Service`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Two-Factor Authentication Setup</h2>
        <p>Hello ${name},</p>
        <p>You have enabled two-factor authentication for your account. Please scan the QR code below with your authenticator app:</p>
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 200px;">
        </div>
        <p>Or enter this code manually: <strong>${secret}</strong></p>
        <p>If you did not enable two-factor authentication, please contact support immediately.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Two-Factor Authentication Setup',
      html,
    });
  }
}

export default new EmailService();

