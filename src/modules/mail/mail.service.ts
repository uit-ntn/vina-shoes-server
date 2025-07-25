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

  async sendOtpEmail(email: string, otp: string, type: 'registration' | 'password_reset'): Promise<void> {
    try {
      // Skip email sending in development if SMTP not configured
      if (!this.configService.get('mail.user') || !this.configService.get('mail.pass')) {
        console.log(`\n🚀 EMAIL MOCK MODE ENABLED`);
        console.log(`📧 OTP email would be sent to: ${email}`);
        console.log(`🔑 OTP Code: ${otp}`);
        console.log(`📝 Type: ${type}`);
        console.log(`=================\n`);
        return;
      }

      const isRegistration = type === 'registration';
      const subject = isRegistration 
        ? '🔐 Your Verification Code - Vinashoes'
        : '🔑 Password Reset Code - Vinashoes';

      console.log(`📤 Sending ${type} OTP email to:`, email);
      const result = await this.transporter.sendMail({
        from: this.configService.get('mail.from'),
        to: email,
        subject,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${isRegistration ? 'Verification Code' : 'Password Reset Code'} - Vinashoes</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header with Store & Developer Info -->
              <div style="background: linear-gradient(135deg, ${isRegistration ? '#667eea 0%, #764ba2 100%' : '#e74c3c 0%, #c0392b 100%'}); padding: 40px 30px;">
                <!-- Top Row: Store & Developer -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                  <tr>
                    <!-- Store Branding (Left) -->
                    <td style="width: 50%; vertical-align: top;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                        👟 VINASHOES
                      </h1>
                      <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 16px; font-weight: 500; opacity: 0.9;">
                        Premium Footwear Collection
                      </p>
                    </td>

                    <!-- Developer Credit (Right) -->
                    <td style="width: 50%; vertical-align: top; text-align: right;">
                      <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 500; opacity: 0.8;">
                        👨‍💻 <strong>Developed by</strong>
                      </p>
                      <h2 style="color: #ffffff; margin: 5px 0 0 0; font-size: 20px; font-weight: 700;">
                        Nguyễn Thanh Nhân
                      </h2>
                      <p style="color: ${isRegistration ? '#e8e8e8' : '#f8d7da'}; margin: 2px 0 0 0; font-size: 12px; opacity: 0.9;">
                        Full-stack Developer & System Architect
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Email Type Badge (Center) -->
                <div style="text-align: center;">
                  <div style="padding: 12px 25px; background-color: rgba(255,255,255,0.2); border-radius: 25px; display: inline-block;">
                    <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">
                      ${isRegistration ? '📧 Email Verification' : '🔐 Password Reset'}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                  ${isRegistration ? '🎉 Welcome to Vinashoes!' : '🔐 Reset Your Password'}
                </h2>
                
                <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                  ${isRegistration 
                    ? 'Thank you for joining our premium footwear community! Please use the verification code below to complete your registration:'
                    : 'We received a request to reset your password. Please use the code below to create a new password:'
                  }
                </p>

                <!-- OTP Code Box -->
                <div style="text-align: center; margin: 35px 0;">
                  <div style="display: inline-block; background-color: #f8f9fa; border: 2px dashed ${isRegistration ? '#667eea' : '#e74c3c'}; border-radius: 10px; padding: 20px 40px;">
                    <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Your Verification Code</p>
                    <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: ${isRegistration ? '#667eea' : '#e74c3c'}; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </div>
                </div>

                <div style="background-color: ${isRegistration ? '#e8f4fd' : '#fff3cd'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${isRegistration ? '#667eea' : '#ffc107'}; margin: 30px 0;">
                  <p style="color: ${isRegistration ? '#0c5460' : '#856404'}; font-size: 14px; margin: 0; line-height: 1.5;">
                    <strong>⚠️ Important:</strong> This verification code will expire in 10 minutes for security reasons. 
                    ${isRegistration 
                      ? "If you didn't create this account, please ignore this email."
                      : "If you didn't request this reset, please ignore this email - your account is safe."
                    }
                  </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #6c757d; font-size: 14px; margin: 0;">
                    Simply enter this code in the app to ${isRegistration ? 'verify your email' : 'reset your password'}.
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #2c3e50; padding: 30px; text-align: center;">
                <p style="color: #bdc3c7; font-size: 14px; margin: 0 0 10px 0;">
                  Best regards,<br>
                  <strong style="color: #ecf0f1;">The Vinashoes ${isRegistration ? 'Team' : 'Security Team'}</strong>
                </p>
                
                <!-- Contact Support Section -->
                <div style="margin: 20px 0; padding: 20px; border-top: 1px solid #34495e; text-align: center;">
                  <p style="color: #bdc3c7; font-size: 14px; margin: 0 0 15px 0;">
                    💬 <strong>Need Help? Contact Our Developer!</strong>
                  </p>
                  <a href="https://www.facebook.com/UIT.NTN.13" 
                     target="_blank"
                     style="display: inline-block;
                            padding: 12px 25px;
                            background: linear-gradient(135deg, #3b5998 0%, #2d4373 100%);
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 25px;
                            font-size: 14px;
                            font-weight: 600;
                            box-shadow: 0 4px 15px rgba(59, 89, 152, 0.3);
                            transition: all 0.3s ease;">
                    📘 Contact Nguyễn Thanh Nhân
                  </a>
                  <p style="color: #95a5a6; font-size: 12px; margin: 10px 0 0 0;">
                    Direct support from the developer
                  </p>
                </div>

                <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                  © 2025 Vinashoes. All rights reserved.<br>
                  ${isRegistration ? 'Premium footwear for every step of your journey.' : 'Your account security is our priority.'}
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log('✅ OTP email sent successfully!', result.messageId);
    } catch (error) {
      console.error(`Failed to send ${type} OTP email:`, error.message);
      console.log(`📧 OTP email would be sent to: ${email}`);
      console.log(`🔑 OTP Code: ${otp}`);
      // Don't throw error to avoid crashing the app
    }
  }

  // Legacy method for backward compatibility
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Generate OTP instead of using token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return this.sendOtpEmail(email, otp, 'registration');
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Generate OTP instead of using token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return this.sendOtpEmail(email, otp, 'password_reset');
  }

  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    return this.sendOtpEmail(email, otp, 'password_reset');
  }
} 