import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    console.log('📧 Email Config:', {
      host: this.configService.get('mail.host'),
      port: this.configService.get('mail.port'),
      user: this.configService.get('mail.user'),
      passLength: this.configService.get('mail.pass')?.length || 0,
      from: this.configService.get('mail.from')
    });

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('mail.host'),
      port: this.configService.get('mail.port'),
      secure: this.configService.get('mail.encryption') === 'SSL',
      auth: {
        user: this.configService.get('mail.user'),
        pass: this.configService.get('mail.pass'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      // Skip email sending in development if SMTP not configured
      if (!this.configService.get('mail.user') || !this.configService.get('mail.pass')) {
        console.log(`\n🚀 EMAIL MOCK MODE ENABLED`);
        console.log(`📧 Verification email would be sent to: ${email}`);
        console.log(`🔗 Verification token: ${token}`);
        console.log(`🌐 Verification URL: ${this.configService.get('APP_URL') || 'http://localhost:3000'}/auth/verify-email?token=${token}`);
        console.log(`=================\n`);
        return;
      }

      const verificationLink = `${this.configService.get('APP_URL')}/auth/verify-email?token=${token}`;

      console.log('📤 Sending verification email to:', email);
      const result = await this.transporter.sendMail({
        from: this.configService.get('mail.from'),
        to: email,
        subject: '✨ Welcome to Vinashoes - Please Verify Your Email',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - Vinashoes</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px;">
                  👟 VINASHOES
                </h1>
                <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">Premium Footwear Collection</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                  Welcome to Vinashoes! 🎉
                </h2>
                
                <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Thank you for joining our premium footwear community. To complete your registration and start exploring our exclusive collection, please verify your email address.
                </p>

                <div style="text-align: center; margin: 35px 0;">
                  <a href="${verificationLink}" 
                     style="display: inline-block; 
                            padding: 15px 35px; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: #ffffff; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            font-size: 16px;
                            font-weight: 600;
                            letter-spacing: 0.5px;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                            transition: all 0.3s ease;">
                    ✉️ Verify Email Address
                  </a>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 30px 0;">
                  <p style="color: #495057; font-size: 14px; margin: 0; line-height: 1.5;">
                    <strong>Security Note:</strong> This verification link will expire in 24 hours for your security. If you didn't create this account, please ignore this email.
                  </p>
                </div>

                <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                  Having trouble clicking the button? Copy and paste this link into your browser:
                </p>
                <p style="color: #667eea; font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0;">
                  ${verificationLink}
                </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #2c3e50; padding: 30px; text-align: center;">
                <p style="color: #bdc3c7; font-size: 14px; margin: 0 0 10px 0;">
                  Best regards,<br>
                  <strong style="color: #ecf0f1;">The Vinashoes Team</strong>
                </p>
                <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                  © 2025 Vinashoes. All rights reserved.<br>
                  Premium footwear for every step of your journey.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log('✅ Email sent successfully!', result.messageId);
    } catch (error) {
      console.error('Failed to send verification email:', error.message);
      console.log(`📧 Verification email would be sent to: ${email}`);
      console.log(`🔗 Verification token: ${token}`);
      // Don't throw error to avoid crashing the app
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      // Skip email sending in development if SMTP not configured
      if (!this.configService.get('mail.user') || !this.configService.get('mail.pass')) {
        console.log(`\n🚀 EMAIL MOCK MODE ENABLED`);
        console.log(`📧 Password reset email would be sent to: ${email}`);
        console.log(`🔗 Reset token: ${token}`);
        console.log(`🌐 Reset URL: ${this.configService.get('APP_URL') || 'http://localhost:3000'}/auth/reset-password?token=${token}`);
        console.log(`=================\n`);
        return;
      }

      const resetLink = `${this.configService.get('APP_URL')}/auth/reset-password?token=${token}`;

      await this.transporter.sendMail({
        from: this.configService.get('mail.from'),
        to: email,
        subject: '🔐 Password Reset Request - Vinashoes',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Vinashoes</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px;">
                  👟 VINASHOES
                </h1>
                <p style="color: #f8d7da; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                  🔐 Reset Your Password
                </h2>
                
                <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  We received a request to reset your password for your Vinashoes account. Click the button below to create a new password.
                </p>

                <div style="text-align: center; margin: 35px 0;">
                  <a href="${resetLink}" 
                     style="display: inline-block; 
                            padding: 15px 35px; 
                            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                            color: #ffffff; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            font-size: 16px;
                            font-weight: 600;
                            letter-spacing: 0.5px;
                            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
                            transition: all 0.3s ease;">
                    🔑 Reset Password
                  </a>
                </div>

                <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 30px 0;">
                  <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                    <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security reasons. If you didn't request this reset, please ignore this email - your account is safe.
                  </p>
                </div>

                <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                  Having trouble clicking the button? Copy and paste this link into your browser:
                </p>
                <p style="color: #e74c3c; font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0;">
                  ${resetLink}
                </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #2c3e50; padding: 30px; text-align: center;">
                <p style="color: #bdc3c7; font-size: 14px; margin: 0 0 10px 0;">
                  Best regards,<br>
                  <strong style="color: #ecf0f1;">The Vinashoes Security Team</strong>
                </p>
                <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                  © 2025 Vinashoes. All rights reserved.<br>
                  Your account security is our priority.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error.message);
      console.log(`📧 Password reset email would be sent to: ${email}`);
      console.log(`🔗 Reset token: ${token}`);
      // Don't throw error to avoid crashing the app
    }
  }
} 