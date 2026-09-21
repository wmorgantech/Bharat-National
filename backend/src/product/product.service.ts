
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private prisma = new PrismaClient();

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    return {
      message: 'Product created successfully',
      product,
    };
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
// Get latest 10 ACTIVE products
async findLimit() {
  return this.prisma.product.findMany({
    where: {
      isActive: true,        
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { category: true, brand: true },
  });
}

  findActive() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        brand: true,
      },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return {
      message: 'Product updated successfully',
      product,
    };
  }

  async remove(id: number) {
    const existing = await this.findOne(id);

    if (!existing.isActive) {
      return {
        message: 'Product already inactive',
        product: existing,
      };
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: 'Product marked as inactive',
      product,
    };
  }
}
