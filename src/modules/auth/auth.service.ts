import {
  Injectable, NotFoundException, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from "../user/user.service";
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './auth.dto';
import { TokenResponseDto } from './dto/refresh-token.dto';
import { User } from '../user/user.schema';
import { MailService } from '../mail/mail.service';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  private resetTokens = new Map<string, { token: string, expires: Date }>(); // email -> { token, expires }

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
    const verificationToken = uuidv4();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // Token expires in 24 hours

    const user = await this.userService.create({
      ...dto,
      password: hash,
      verificationToken: verificationToken,
      verificationExpires: verificationExpiry,
    });

    // Send verification email
    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.verificationExpires < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.userService.verifyEmail(user._id.toString());
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
}
