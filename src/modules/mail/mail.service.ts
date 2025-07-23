import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
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
    const verificationLink = `${this.configService.get('APP_URL')}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get('mail.from'),
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Email Verification</h1>
        <p>Hello!</p>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" 
           style="display: inline-block; 
                  padding: 10px 20px; 
                  background-color: #4CAF50; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  margin: 20px 0;">
          Verify Email Address
        </a>
        <p>If you did not create an account, no further action is required.</p>
        <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
        <p>${verificationLink}</p>
        <p>Best regards,<br>Your Application Team</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${this.configService.get('APP_URL')}/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get('mail.from'),
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello!</p>
        <p>You are receiving this email because we received a password reset request for your account.</p>
        <a href="${resetLink}" 
           style="display: inline-block; 
                  padding: 10px 20px; 
                  background-color: #4CAF50; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  margin: 20px 0;">
          Reset Password
        </a>
        <p>This password reset link will expire in 1 hour.</p>
        <p>If you did not request a password reset, no further action is required.</p>
        <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
        <p>${resetLink}</p>
        <p>Best regards,<br>Your Application Team</p>
      `,
    });
  }
} 