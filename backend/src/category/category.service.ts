
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class CategoryService {
  private prisma = new PrismaClient();

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return {
      message: 'Category created successfully',
      category,
    };
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findActive() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
   
    await this.findOne(id);

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return {
      message: 'Category updated successfully',
      category,
    };
  }

  async remove(id: number) {
    const existing = await this.findOne(id); 

    
    if (!existing.isActive) {
      return {
        message: 'Category already inactive',
        category: existing,
      };
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: 'Category marked as inactive',
      category,
    };
  }

}
