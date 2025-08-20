import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id?: string;
  _id?: string;
  email: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '1h'),
    };
  }

  verifyToken(token: string): TokenPayload {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken);

      // Create new tokens with fresh payload
      const newPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return this.generateTokens(newPayload);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  // Helper method to create user payload for token generation
  createTokenPayload(user: User): Omit<TokenPayload, 'iat' | 'exp'> {
    return {
      sub: user.id || user._id || '',
      email: user.email,
      role: user.role || 'user',
    };
  }
}
