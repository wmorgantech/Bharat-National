// auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(private jwtService: JwtService) {}

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
        role: data.role || 'USER',
      },
    });

    // Generate JWT token
    const payload = {
      sub: user.id,
      mobilenumber: user.mobilenumber,
      role: user.role,
      type: 'USER',
    };

    const access_token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Signup successful',
      access_token,
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

    const payload = {
      sub: user.id,
      mobilenumber: user.mobilenumber,
      role: user.role,
      type: 'USER',
    };

    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login successful',
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        mobilenumber: user.mobilenumber,
        role: user.role,
      },
      // redirectTo: user.role === 'ADMIN' ? '/admin/dashboard' : '/',
    };
  }

}