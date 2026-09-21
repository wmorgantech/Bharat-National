// src/brand/brand.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  private prisma = new PrismaClient();

  async create(createBrandDto: CreateBrandDto) {
    const brand = await this.prisma.brand.create({
      data: createBrandDto,
    });

    return {
      message: 'Brand created successfully',
      brand,
    };
  }

  findAll() {
    return this.prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findActive() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
  
    await this.findOne(id);

    const brand = await this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });

    return {
      message: 'Brand updated successfully',
      brand,
    };
  }

  async remove(id: number) {
    const existing = await this.findOne(id);

    if (!existing.isActive) {
      return {
        message: 'Brand already inactive',
        category: existing,
      };
    }

    const category = await this.prisma.brand.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: 'Brand marked as inactive',
      category,
    };
  }
}
