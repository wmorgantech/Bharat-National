// strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { getJwtSecret } from '../config/env';

/** Shape attached to `request.user` for every authenticated request. */
export interface AuthUser {
  userId: number;
  role: string;
  type: 'USER' | 'ADMIN';
  mobilenumber?: string | null;
  name?: string | null;
  email?: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private prisma = new PrismaClient();

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any): Promise<AuthUser> {
    // The principal type is taken from the token claim, not inferred from which
    // optional fields happen to be present.
    if (payload?.type === 'USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          mobilenumber: true,
          role: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        userId: user.id,
        mobilenumber: user.mobilenumber,
        name: user.name,
        // Authority always comes from the database row, never from the token.
        role: user.role,
        type: 'USER',
      };
    }

    if (payload?.type === 'ADMIN') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Admin not found or inactive');
      }

      return {
        userId: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'ADMIN',
      };
    }

    throw new UnauthorizedException('Invalid token payload');
  }
}
