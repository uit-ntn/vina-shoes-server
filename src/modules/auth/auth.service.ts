import {
  Injectable, NotFoundException, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from "../user/user.service";
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './auth.dto';
import { TokenResponseDto } from './dto/refresh-token';
import { User } from '../user/user.schema';

@Injectable()
export class AuthService {
  private resetTokens = new Map<string, string>(); // email -> token
  private refreshTokens = new Map<string, string>(); // userId -> refreshToken

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
    return this.userService.create({
      ...dto,
      password: hash,
    });
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException();
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException();
    return user;
  }

  async generateTokens(userId: string, email: string): Promise<TokenResponseDto> {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    // Store refresh token
    this.refreshTokens.set(userId, refreshToken);
    
    return {
      accessToken,
      refreshToken,
    };
  }

  async login(user: User): Promise<TokenResponseDto> {
    const tokens = await this.generateTokens(String(user._id), user.email);
    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const storedRefreshToken = this.refreshTokens.get(decoded.sub);
      
      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

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

    const token = uuidv4();
    this.resetTokens.set(email, token);

    console.log(`Reset token for ${email}: ${token}`);
    return { message: 'Reset token sent to email' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const savedToken = this.resetTokens.get(email);
    if (!savedToken || savedToken !== token)
      throw new BadRequestException('Invalid or expired token');

    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException();

    const hash = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(String(user._id), hash);
    this.resetTokens.delete(email);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPwd: string, newPwd: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException();

    const valid = await bcrypt.compare(currentPwd, user.password);
    if (!valid) throw new UnauthorizedException('Wrong current password');

    const hash = await bcrypt.hash(newPwd, 10);
    await this.userService.updatePassword(userId, hash);

    return { message: 'Password changed successfully' };
  }

  async logout(userId: string): Promise<void> {
    this.refreshTokens.delete(userId);
  }
}
