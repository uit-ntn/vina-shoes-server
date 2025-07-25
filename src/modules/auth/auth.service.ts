import {
  Injectable, NotFoundException, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from "../user/user.service";
import { v4 as uuidv4 } from 'uuid';
import { TokenResponseDto } from './dto/refresh-token.dto';
import { User } from '../user/user.schema';
import { MailService } from '../mail/mail.service';
import { Types } from 'mongoose';
import { 
  SendOtpDto, 
  VerifyOtpDto, 
  RegisterWithOtpDto, 
  ResetPasswordWithOtpDto,
  OtpResponseDto 
} from './dto/otp.dto';

// Add DTOs for new flow
interface RegisterDto {
  email: string;
  fullName: string;
  password: string;
}

interface VerifyEmailDto {
  email: string;
  otp: string;
}

@Injectable()
export class AuthService {
  private resetTokens = new Map<string, { token: string, expires: Date }>(); // email -> { token, expires }
  private pendingRegistrations = new Map<string, { userData: RegisterWithOtpDto, expires: Date }>(); // email -> { userData, expires }

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async register(dto: RegisterDto): Promise<OtpResponseDto> {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
    const otp = this.generateOtp();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // 10 minutes expiry

    // Create user with all data but not verified
    await this.userService.create({
      name: dto.fullName,
      email: dto.email,
      password: hash,
      otpCode: otp,
      otpExpiry: expires,
      otpType: 'registration'
    });

    // Send OTP email
    await this.mailService.sendOtpEmail(dto.email, otp, 'registration');

    return {
      message: 'OTP sent to your email for registration',
      email: dto.email,
      expiresAt: expires
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<any> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');

    // Verify OTP
    if (user.otpCode !== dto.otp || user.otpType !== 'registration') {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Update user to verified and clear OTP
    const updatedUser = await this.userService.update(user._id.toString(), {
      emailVerified: true,
      otpCode: undefined,
      otpExpiry: undefined,
      otpType: undefined
    });

    if (!updatedUser) throw new BadRequestException('Failed to update user');

    // Generate JWT token
    const payload = { userId: updatedUser._id, email: updatedUser.email };
    const token = this.jwtService.sign(payload);

    return {
      id: updatedUser._id.toString(),
      fullName: updatedUser.name,
      email: updatedUser.email,
      token,
      message: 'Registration completed successfully'
    };
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = uuidv4();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24);

    await this.userService.updateVerificationToken(
      user._id.toString(),
      verificationToken,
      verificationExpiry
    );

    await this.mailService.sendVerificationEmail(user.email, verificationToken);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async generateTokens(userId: string, email: string): Promise<TokenResponseDto> {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    // Store refresh token in user's refreshTokens array
    await this.userService.addRefreshToken(userId, refreshToken);
    
    return {
      accessToken,
      refreshToken,
    };
  }

  async login(user: User): Promise<TokenResponseDto> {
    const tokens = await this.generateTokens(user._id.toString(), user.email);
    
    // Update last login time
    await this.userService.updateLastLogin(user._id.toString());
    
    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      
      // Validate refresh token exists in user's refreshTokens array
      const isValidToken = await this.userService.validateRefreshToken(decoded.sub, refreshToken);
      if (!isValidToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Remove old refresh token
      await this.userService.removeRefreshToken(decoded.sub, refreshToken);

      // Generate new tokens
      const tokens = await this.generateTokens(decoded.sub, decoded.email);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // Generate reset token
    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    // Store token with expiration
    this.resetTokens.set(email, { token, expires });

    // Send reset email
    await this.mailService.sendPasswordResetEmail(email, token);

    return { message: 'Password reset instructions sent to your email' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const resetData = this.resetTokens.get(email);
    if (!resetData || resetData.token !== token) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetData.expires < new Date()) {
      this.resetTokens.delete(email);
      throw new BadRequestException('Reset token has expired');
    }

    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user._id.toString(), hash);

    // Clear all refresh tokens for security
    await this.userService.clearAllRefreshTokens(user._id.toString());

    // Clear reset token
    this.resetTokens.delete(email);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPwd: string, newPwd: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(currentPwd, user.password);
    if (!valid) throw new UnauthorizedException('Wrong current password');

    const hash = await bcrypt.hash(newPwd, 10);
    await this.userService.updatePassword(userId, hash);

    // Clear all refresh tokens for security after password change
    await this.userService.clearAllRefreshTokens(userId);

    return { message: 'Password changed successfully' };
  }

  async logout(userId: string): Promise<void> {
    // Clear all refresh tokens
    await this.userService.clearAllRefreshTokens(userId);

    // Update last login time
    await this.userService.updateLastLogin(userId);
  }

  async logoutFromDevice(userId: string, refreshToken: string): Promise<void> {
    // Remove specific refresh token
    await this.userService.removeRefreshToken(userId, refreshToken);
  }

  // =============== OTP METHODS ===============

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendRegistrationOtp(dto: SendOtpDto): Promise<OtpResponseDto> {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const otp = this.generateOtp();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // 10 minutes expiry

    // Update user with OTP info
    const user = await this.userService.create({
      name: 'temp',
      email: dto.email,
      password: 'temp',
      otpCode: otp,
      otpExpiry: expires,
      otpType: 'registration'
    });

    // Send OTP email
    await this.mailService.sendOtpEmail(dto.email, otp, 'registration');

    return {
      message: 'OTP sent to your email',
      email: dto.email,
      expiresAt: expires
    };
  }

  async registerWithOtp(dto: RegisterWithOtpDto): Promise<User> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('Invalid email or OTP');

    // Verify OTP
    if (user.otpCode !== dto.otp || user.otpType !== 'registration') {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Hash password and update user
    const hash = await bcrypt.hash(dto.password, 10);
    const updatedUser = await this.userService.update(user._id.toString(), {
      name: dto.name,
      password: hash,
      emailVerified: true,
      otpCode: undefined,
      otpExpiry: undefined,
      otpType: undefined
    });

    if (!updatedUser) throw new BadRequestException('Failed to update user');
    return updatedUser;
  }

  async sendPasswordResetOtp(dto: SendOtpDto): Promise<OtpResponseDto> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = this.generateOtp();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // 10 minutes expiry

    // Update user with OTP info
    await this.userService.update(user._id.toString(), {
      otpCode: otp,
      otpExpiry: expires,
      otpType: 'password_reset'
    });

    // Send OTP email
    await this.mailService.sendOtpEmail(dto.email, otp, 'password_reset');

    return {
      message: 'Password reset OTP sent to your email',
      email: dto.email,
      expiresAt: expires
    };
  }

  async resetPasswordWithOtp(dto: ResetPasswordWithOtpDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    // Verify OTP
    if (user.otpCode !== dto.otp || user.otpType !== 'password_reset') {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Hash new password and update
    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.userService.update(user._id.toString(), {
      password: hash,
      otpCode: undefined,
      otpExpiry: undefined,
      otpType: undefined
    });

    // Clear all refresh tokens for security
    await this.userService.clearAllRefreshTokens(user._id.toString());

    return { message: 'Password reset successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string; valid: boolean }> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const isValid = user.otpCode === dto.otp && user.otpExpiry > new Date();

    return {
      message: isValid ? 'OTP is valid' : 'Invalid or expired OTP',
      valid: isValid
    };
  }
}
