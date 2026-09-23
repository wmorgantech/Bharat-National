// auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import { ACCESS_TOKEN_TTL } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private refreshTokens: RefreshTokenService,
    private prisma: PrismaService,
  ) {}

  /**
   * Access tokens carry only the subject and principal type. Role and identity
   * are re-read from the database on every request by JwtStrategy, so putting
   * them in the token would only widen what a leaked token discloses.
   */
  private signAccessToken(userId: number): string {
    return this.jwtService.sign({ sub: userId, type: 'USER' });
  }

  // ✅ SIGNUP with role
  async signup(data: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { mobilenumber: data.mobilenumber },
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this mobile number');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        mobilenumber: data.mobilenumber,
        password: hashedPassword,
        // Role is fixed server-side; it is never taken from the request body.
        role: 'USER',
      },
    });

    const access_token = this.signAccessToken(user.id);
    const refresh = await this.refreshTokens.issue({
      type: 'USER',
      id: user.id,
    });

    this.refreshTokens.maybeCleanup();

    return {
      success: true,
      message: 'Signup successful',
      access_token,
      refresh_token: refresh.token,
      expires_in: ACCESS_TOKEN_TTL,
      user: {
        id: user.id,
        name: user.name,
        mobilenumber: user.mobilenumber,
        role: user.role,
      },
    };
  }

  // ✅ LOGIN with role check
  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobilenumber: data.mobilenumber },
    });

    if (!user) {
      throw new UnauthorizedException('User not found with this mobile number');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not set for this user');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = this.signAccessToken(user.id);
    const refresh = await this.refreshTokens.issue({
      type: 'USER',
      id: user.id,
    });

    this.refreshTokens.maybeCleanup();

    return {
      success: true,
      message: 'Login successful',
      access_token: token,
      refresh_token: refresh.token,
      expires_in: ACCESS_TOKEN_TTL,
      user: {
        id: user.id,
        name: user.name,
        mobilenumber: user.mobilenumber,
        role: user.role,
      },
      // redirectTo: user.role === 'ADMIN' ? '/admin/dashboard' : '/',
    };
  }

  /** Single-use rotation: the presented token is revoked and replaced. */
  async refresh(refreshToken: string) {
    const { principal, refresh } = await this.refreshTokens.rotate(
      refreshToken,
      'USER',
    );

    const user = await this.prisma.user.findUnique({
      where: { id: principal.id },
      select: { id: true, name: true, mobilenumber: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    this.refreshTokens.maybeCleanup();

    return {
      success: true,
      access_token: this.signAccessToken(user.id),
      refresh_token: refresh.token,
      expires_in: ACCESS_TOKEN_TTL,
      user,
    };
  }

  /** Per-device logout. */
  async logout(refreshToken: string) {
    await this.refreshTokens.revoke(refreshToken);
    return { success: true, message: 'Logged out' };
  }

  /** Logout everywhere for the authenticated user. */
  async logoutAll(userId: number) {
    const revoked = await this.refreshTokens.revokeAllForPrincipal({
      type: 'USER',
      id: userId,
    });

    return { success: true, message: 'Logged out of all sessions', revoked };
  }
}