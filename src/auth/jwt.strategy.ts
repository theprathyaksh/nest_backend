import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_secret_key', // Replace with a secure key in environment variables
    });
  }

  async validate(payload: any) {
    // This function is called when JWT is valid
    return { userId: payload.sub, email: payload.email };
  }
}
