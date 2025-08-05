import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  /**
   * Validates JWT payload and returns user information for request context
   * @param payload - JWT payload containing user information
   * @returns User object with userId and email
   */
  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      email: payload.email 
    };
  }
}
