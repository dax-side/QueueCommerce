import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto } from './auth.service';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    // In a real implementation, you would validate credentials against user service
    // For now, this is a placeholder that generates tokens for valid-looking requests

    if (!loginDto.email || !loginDto.password) {
      throw new Error('Email and password are required');
    }

    // Placeholder user data - in real implementation, validate against user service
    const user = {
      id: '1',
      email: loginDto.email,
      role: 'user',
    };

    const tokens = this.authService.generateTokens(
      this.authService.createTokenPayload(user),
    );

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    // In a real implementation, you would create user via user service
    // For now, this is a placeholder

    if (!registerDto.email || !registerDto.password || !registerDto.name) {
      throw new Error('Email, password, and name are required');
    }

    // Placeholder user data - in real implementation, create via user service
    const user = {
      id: '1',
      email: registerDto.email,
      name: registerDto.name,
      role: 'user',
    };

    const tokens = this.authService.generateTokens(
      this.authService.createTokenPayload(user),
    );

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body('refreshToken') refreshToken: string) {
    const tokens = this.authService.refreshToken(refreshToken);

    return {
      message: 'Token refreshed successfully',
      ...tokens,
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verify(@Headers('authorization') authHeader: string) {
    const token = this.authService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new Error('Authorization token is required');
    }

    const payload = this.authService.verifyToken(token);

    return {
      message: 'Token is valid',
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      },
    };
  }
}
