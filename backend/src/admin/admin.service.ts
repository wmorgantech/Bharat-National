// admin.service.ts (Without role)
import { 
  Injectable, 
  BadRequestException, 
  ForbiddenException,
  ConflictException,
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto, LoginAdminDto } from './dto/create-admin.dto';

import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  constructor(private jwtService: JwtService) {}

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

    // Generate JWT token
    const payload = {
      sub: newAdmin.id,
      email: newAdmin.email,
      type: 'ADMIN',
    };

    const access_token = this.jwtService.sign(payload);

    // Return response without password
    return {
      success: true,
      message: 'Admin registered successfully',
      access_token,
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

    // Generate JWT token
    const payload = {
      sub: admin.id,
      email: admin.email,
      type: 'ADMIN',
    };

    const access_token = this.jwtService.sign(payload);

    // Return response without password
    return {
      success: true,
      message: 'Login successful',
      access_token,
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

 


}