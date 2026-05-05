import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: data.categoryId,
        isDeleted: false,
      },
    });

    if (!category) {
      throw new BadRequestException('Category không tồn tại');
    }

    return this.prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
        imageId: data.imageId,
        modelUrl: data.modelUrl,
        dimensions: data.dimensions,
        weight: data.weight,
        stock: data.stock,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 🔥 Admin xem tất cả products (bao gồm cả ẩn)
  async findAllAdmin() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 🔥 Toggle bật/tắt ẩn sản phẩm (Admin)
  async toggleActive(id: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        isActive: !product.isActive,
      },
      include: {
        category: true,
      },
    });
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid product id');
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isDeleted: false,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy product');
    }

    return product;
  }

  // 🔥 Admin xem chi tiết (cho phép xem cả ẩn)
  async findOneAdmin(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid product id');
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy product');
    }

    return product;
  }

  async update(id: number, data: UpdateProductDto) {
    await this.findOneAdmin(id);

    if (data.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: data.categoryId,
          isDeleted: false,
        },
      });

      if (!category) {
        throw new BadRequestException('Category không tồn tại');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
        imageId: data.imageId,
        modelUrl: data.modelUrl,
        dimensions: data.dimensions,
        weight: data.weight,
        stock: data.stock,
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async getBestSellingProducts(limit = 5) {
    // 1. Lấy top productId theo số lượng bán
    const result = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: 'COMPLETED',
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    if (!result.length) return [];

    // 2. Lấy danh sách productId
    const productIds = result.map((item) => item.productId);

    // 3. Query product
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isDeleted: false,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    // 4. Map lại + giữ đúng thứ tự best selling
    return result
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) return null;

        return {
          ...product,
          totalSold: item._sum.quantity ?? 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
}
