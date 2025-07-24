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
import { RegisterDto, LoginDto } from './auth.dto';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/password.dto';
import { RefreshTokenDto, TokenResponseDto } from './dto/refresh-token.dto';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto, description: 'User registration data' })
  @ApiCreatedResponse({ 
    description: 'User has been successfully created and verification email sent (verification optional for login)',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        role: { type: 'string', example: 'user' }
      }
    }
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Verify email address' })
  @Get('verify-email')
  async verifyEmail(@Query() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.token);
    return { message: 'Email verified successfully' };
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.authService.resendVerificationEmail(dto.email);
    return { message: 'Verification email sent successfully' };
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

  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ 
    description: 'Reset instructions sent to email',
    schema: {
      properties: {
        message: { 
          type: 'string', 
          example: 'Password reset instructions sent to your email' 
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordDto })
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
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.token, dto.newPassword);
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
}
