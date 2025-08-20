import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as passport from 'passport-jwt';

import { TokenPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(passport.Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: passport.ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: TokenPayload): { id: string; email: string; role: string } {
    // In a real implementation, you might want to validate the user still exists
    // by calling the user service here
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
