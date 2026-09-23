// admin.service.ts (Without role)
import { 
  Injectable, 
  BadRequestException, 
  ForbiddenException,
  ConflictException,
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto, LoginAdminDto } from './dto/create-admin.dto';

import { UpdateAdminDto } from './dto/update-admin.dto';
import { RefreshTokenService } from '../auth/refresh-token.service';
import { ACCESS_TOKEN_TTL } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private jwtService: JwtService,
    private refreshTokens: RefreshTokenService,
    private prisma: PrismaService,
  ) {}

  /** Access tokens carry only the subject and principal type. */
  private signAccessToken(adminId: number): string {
    return this.jwtService.sign({ sub: adminId, type: 'ADMIN' });
  }

  // ✅ REGISTER NEW ADMIN
  async register(createAdminDto: CreateAdminDto) {
    const { email, password, isActive } = createAdminDto;

    // Check if admin already exists
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email },
    });
    
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = await this.prisma.admin.create({
      data: { 
        email, 
        password: hashedPassword,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    const access_token = this.signAccessToken(newAdmin.id);
    const refresh = await this.refreshTokens.issue({
      type: 'ADMIN',
      id: newAdmin.id,
    });

    // Return response without password
    return {
      success: true,
      message: 'Admin registered successfully',
      access_token,
      refresh_token: refresh.token,
      expires_in: ACCESS_TOKEN_TTL,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        isActive: newAdmin.isActive,
        createdAt: newAdmin.createdAt,
      },
    };
  }

  // ✅ LOGIN ADMIN
  async login(loginAdminDto: LoginAdminDto) {
    const { email, password } = loginAdminDto;

    // Find admin by email
    const admin = await this.prisma.admin.findUnique({ 
      where: { email } 
    });
    
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw new ForbiddenException('Your account has been deactivated. Please contact super admin.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const access_token = this.signAccessToken(admin.id);
    const refresh = await this.refreshTokens.issue({
      type: 'ADMIN',
      id: admin.id,
    });

    this.refreshTokens.maybeCleanup();

    // Return response without password
    return {
      success: true,
      message: 'Login successful',
      access_token,
      refresh_token: refresh.token,
      expires_in: ACCESS_TOKEN_TTL,
      admin: {
        id: admin.id,
        email: admin.email,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
      // redirectTo: '/admin/dashboard',
    };
  }

  /** Single-use rotation for an admin session. */
  async refresh(refreshToken: string) {
    const { principal, refresh } = await this.refreshTokens.rotate(
      refreshToken,
      'ADMIN',
    );

    const admin = await this.prisma.admin.findUnique({
      where: { id: principal.id },
      select: { id: true, email: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      // A deactivated admin must not be able to refresh their way back in.
      await this.refreshTokens.revokeAllForPrincipal({
        type: 'ADMIN',
        id: principal.id,
      });
      throw new UnauthorizedException('Admin not found or inactive');
    }

    this.refreshTokens.maybeCleanup();

    return {
      success: true,
      access_token: this.signAccessToken(admin.id),
      refresh_token: refresh.token,
      expires_in: ACCESS_TOKEN_TTL,
      admin,
    };
  }

  /** Per-device logout. */
  async logout(refreshToken: string) {
    await this.refreshTokens.revoke(refreshToken);
    return { success: true, message: 'Logged out' };
  }

  /** Logout everywhere for the authenticated admin. */
  async logoutAll(adminId: number) {
    const revoked = await this.refreshTokens.revokeAllForPrincipal({
      type: 'ADMIN',
      id: adminId,
    });

    return { success: true, message: 'Logged out of all sessions', revoked };
  }

 


}