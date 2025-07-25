import { Body, Controller, Post, UseGuards, Request, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody, 
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  getSchemaPath
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { ChangePasswordDto } from './dto/password.dto';
import { RefreshTokenDto, TokenResponseDto } from './dto/refresh-token.dto';
import {
  SendOtpDto,
  RegisterWithOtpDto,
  VerifyOtpDto,
  ResetPasswordWithOtpDto,
  OtpResponseDto
} from './dto/otp.dto';

// Add these DTOs for the new flow
export class RegisterDto {
  email: string;
  fullName: string;
  password: string;
}

export class VerifyEmailDto {
  email: string;
  otp: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register with email, password, fullName and send OTP' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        fullName: { type: 'string', example: 'John Doe' },
        password: { type: 'string', example: 'password123' }
      },
      required: ['email', 'fullName', 'password']
    }
  })
  @ApiCreatedResponse({ 
    description: 'OTP sent successfully',
    type: OtpResponseDto
  })
  @ApiBadRequestResponse({ description: 'Email already exists' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Verify email with OTP to complete registration' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        otp: { type: 'string', example: '123456' }
      },
      required: ['email', 'otp']
    }
  })
  @ApiOkResponse({ 
    description: 'Registration completed successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        token: { type: 'string' },
        message: { type: 'string', example: 'Registration completed successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid OTP or OTP expired' })
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ 
    type: LoginDto,
    description: 'User credentials'
  })
  @ApiOkResponse({ 
    description: 'User successfully authenticated',
    type: TokenResponseDto
  })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'New access token generated',
    type: TokenResponseDto
  })
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @ApiOperation({ summary: 'Logout user from all devices' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    description: 'User successfully logged out from all devices',
    schema: {
      properties: {
        message: { type: 'string', example: 'Logged out successfully from all devices' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('logout')
  async logout(@Request() req) {
    await this.authService.logout(req.user.userId);
    return { message: 'Logged out successfully from all devices' };
  }

  @ApiOperation({ summary: 'Logout user from specific device' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        refreshToken: { 
          type: 'string', 
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'The refresh token of the device to logout from'
        }
      },
      required: ['refreshToken']
    }
  })
  @ApiOkResponse({
    description: 'User successfully logged out from specific device',
    schema: {
      properties: {
        message: { type: 'string', example: 'Logged out successfully from device' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('logout-device')
  async logoutFromDevice(@Request() req, @Body() body: { refreshToken: string }) {
    await this.authService.logoutFromDevice(req.user.userId, body.refreshToken);
    return { message: 'Logged out successfully from device' };
  }

  @ApiOperation({ summary: 'Send OTP for password reset' })
  @ApiBody({ type: SendOtpDto })
  @ApiOkResponse({ 
    description: 'Password reset OTP sent successfully',
    type: OtpResponseDto
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: SendOtpDto) {
    return this.authService.sendPasswordResetOtp(dto);
  }

  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiBody({ type: ResetPasswordWithOtpDto })
  @ApiOkResponse({ 
    description: 'Password reset successful',
    schema: {
      properties: {
        message: { 
          type: 'string', 
          example: 'Password reset successfully' 
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid OTP or OTP expired' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordWithOtpDto) {
    return this.authService.resetPasswordWithOtp(dto);
  }

  @ApiOperation({ summary: 'Change password (requires authentication)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({ 
    description: 'Password changed successful',
    schema: {
      properties: {
        message: { 
          type: 'string', 
          example: 'Password changed successfully' 
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or invalid current password' })
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() dto: ChangePasswordDto
  ) {
    return this.authService.changePassword(
      req.user.userId, 
      dto.currentPassword, 
      dto.newPassword
    );
  }

  // =============== UTILITY ENDPOINT ===============

  @ApiOperation({ summary: 'Verify OTP code (optional utility)' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({ 
    description: 'OTP verification result',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        valid: { type: 'boolean' }
      }
    }
  })
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }
}
