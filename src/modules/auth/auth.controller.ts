import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody, 
  ApiCreatedResponse,
  ApiOkResponse,
  getSchemaPath
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  LoginResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto
} from './auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto, description: 'User registration data' })
  @ApiCreatedResponse({ 
    description: 'User has been successfully created',
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

  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ 
    type: LoginDto,
    description: 'User credentials'
  })
  @ApiOkResponse({ 
    description: 'User successfully authenticated',
    schema: {
      type: 'object',
      properties: {
        access_token: { 
          type: 'string', 
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', example: 'user' }
          }
        }
      }
    }
  })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ 
    description: 'Reset token sent',
    schema: {
      properties: {
        message: { type: 'string', example: 'Reset token sent to email' }
      }
    }
  })
  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ 
    description: 'Password reset successful',
    schema: {
      properties: {
        message: { type: 'string', example: 'Password reset successfully' }
      }
    }
  })
  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.token, dto.newPassword);
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({ 
    description: 'Password changed successful',
    schema: {
      properties: {
        message: { type: 'string', example: 'Password changed successfully' }
      }
    }
  })
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
