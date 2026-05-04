import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-orders.dto.js';
import { OrdersGateway } from './orders.gateway.js';
import { getDiscountPercentageByTier } from '../utils/loyalty.util.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  /**
   * Calculate user's loyalty tier from only COMPLETED orders
   */
  private async getUserTierFromCompletedOrders(userId: number): Promise<number> {
    const result = await this.prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        userId,
        status: 'COMPLETED',
        isDeleted: false,
      },
    });

    return result._sum.total || 0;
  }

  private readonly orderInclude = {
    user: true,
    items: {
      include: {
        product: true,
      },
    },
    payments: true,
    logs: true,
  } as const;

  private readonly validPaymentMethods: PaymentMethod[] = [
    'CASH',
    'BANK_TRANSFER',
    'MOMO',
    'VNPAY',
  ];

  async findAll() {
    return this.prisma.order.findMany({
      where: { isDeleted: false },
      include: this.orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, isDeleted: false },
      include: this.orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async delete(id: number, userId?: number) {
    const order = await this.findOne(id);

    if (order.status !== 'CANCELLED') {
      throw new BadRequestException('Only cancelled orders can be deleted');
    }

    return this.prisma.$transaction(async (prisma) => {
      const deleted = await prisma.order.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
        include: this.orderInclude,
      });

      await prisma.orderLog.create({
        data: {
          orderId: id,
          status: 'CANCELLED',
          note: 'Soft deleted order',
          updatedById: userId,
        },
      });

      return deleted;
    });
  }

  async create(data: CreateOrderDto) {
    const {
      userId,
      phone,
      address,
      items,
      usedPoint: inputUsedPoint,
      paymentMethod,
    } = data;

    const usedPoint = inputUsedPoint ?? 0;
    const paymentMethodToUse = (paymentMethod ?? 'CASH') as PaymentMethod;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (!this.validPaymentMethods.includes(paymentMethodToUse)) {
      throw new BadRequestException(
        `Invalid payment method: ${paymentMethodToUse}`,
      );
    }

    const createdOrder = await this.prisma.$transaction(
      async (prisma) => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new BadRequestException('User not found');
        }

        if (usedPoint < 0) {
          throw new BadRequestException('usedPoint cannot be negative');
        }

        if (usedPoint > user.loyaltyPoint) {
          throw new BadRequestException('Not enough loyalty points');
        }

        const productIds = [...new Set(items.map((item) => item.productId))];

        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });

        const productMap = new Map(
          products.map((product) => [product.id, product]),
        );

        let subtotal = 0;

        const order = await prisma.order.create({
          data: {
            userId,
            phone,
            address,
            status: 'PENDING',
            total: 0,
            usedPoint,
            earnedPoint: 0,
            isDeleted: false,
          },
        });

        for (const item of items) {
          if (item.quantity <= 0) {
            throw new BadRequestException('Quantity must be greater than 0');
          }

          const product = productMap.get(item.productId);

          if (!product) {
            throw new BadRequestException(
              `Product ${item.productId} not found`,
            );
          }

          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              quantity: item.quantity,
              productName: product.name,
              basePrice: product.price,
            },
          });

          subtotal += product.price * item.quantity;
        }

        // Tính giảm giá hạng dựa trên các đơn COMPLETED
        const completedOrdersTotal =
          await this.getUserTierFromCompletedOrders(userId);

        const discountPercentage =
          getDiscountPercentageByTier(completedOrdersTotal);

        const discountAmount = Math.floor(subtotal * discountPercentage);

        // Không cho dùng điểm vượt quá số tiền sau giảm giá hạng
        const maxAllowedDiscount = subtotal - discountAmount;

        if (usedPoint > maxAllowedDiscount) {
          throw new BadRequestException(
            `usedPoint (${usedPoint}) cannot exceed ${maxAllowedDiscount} (subtotal - tier discount)`,
          );
        }

        // Tổng tiền cuối cùng khách phải thanh toán
        const total = Math.max(0, subtotal - usedPoint - discountAmount);

        // Điểm tích lũy = 10% tổng tiền thanh toán cuối cùng
        const earnedPoint = Math.floor(total * 0.1);

        if (usedPoint > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              loyaltyPoint: { decrement: usedPoint },
            },
          });
        }

        await prisma.payment.create({
          data: {
            orderId: order.id,
            method: paymentMethodToUse,
            status: 'PENDING',
            amount: total,
          },
        });

        await prisma.orderLog.create({
          data: {
            orderId: order.id,
            status: 'PENDING',
            note: `Order created${
              discountPercentage > 0
                ? ` - Applied ${
                    discountPercentage * 100
                  }% tier discount (${discountAmount} VND)`
                : ''
            }`,
          },
        });

        return prisma.order.update({
          where: { id: order.id },
          data: {
            total,
            earnedPoint,
          },
          include: this.orderInclude,
        });
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    this.ordersGateway.emitNewOrder(createdOrder);
    return createdOrder;
  }

  async updateStatus(id: number, status: OrderStatus, userId?: number) {
    const order = await this.findOne(id);

    if (order.status === status) {
      throw new BadRequestException(`Order is already ${status}`);
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SHIPPING', 'CANCELLED'],
      SHIPPING: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new BadRequestException(
        `Cannot change status from ${order.status} to ${status}`,
      );
    }

    if (status === 'CONFIRMED' && order.status === 'PENDING') {
      const latestVnpayPayment = [...(order.payments ?? [])]
        .filter((payment) => payment.method === 'VNPAY')
        .sort((a, b) => b.id - a.id)[0];

      if (latestVnpayPayment && latestVnpayPayment.status !== 'SUCCESS') {
        throw new BadRequestException(
          `Cannot confirm order with VNPAY payment that is not successful. Current payment status: ${latestVnpayPayment.status}`,
        );
      }
    }

    const updated = await this.prisma.$transaction(async (prisma) => {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status },
        include: this.orderInclude,
      });

      await prisma.orderLog.create({
        data: {
          orderId: id,
          status,
          updatedById: userId,
        },
      });

      // Chỉ khi đơn COMPLETED mới cộng điểm vào user
      if (status === 'COMPLETED') {
        const updatedUser = await prisma.user.update({
          where: { id: order.userId },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: order.total },
            loyaltyPoint: { increment: order.earnedPoint },
          },
        });
        
        // Emit realtime loyalty points update
        this.ordersGateway.emitLoyaltyPointsUpdated(
          order.userId,
          updatedUser.loyaltyPoint,
        );
      }

      // Nếu hủy đơn thì hoàn lại điểm đã dùng
      if (status === 'CANCELLED' && order.usedPoint > 0) {
        const updatedUser = await prisma.user.update({
          where: { id: order.userId },
          data: {
            loyaltyPoint: { increment: order.usedPoint },
          },
        });
        
        // Emit realtime loyalty points update
        this.ordersGateway.emitLoyaltyPointsUpdated(
          order.userId,
          updatedUser.loyaltyPoint,
        );
      }

      return updatedOrder;
    });

    this.ordersGateway.emitOrderUpdated(updated);
    return updated;
  }

  async updateInfo(
    id: number,
    data: { phone?: string; address?: string; usedPoint?: number },
  ) {
    const order = await this.findOne(id);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be updated');
    }

    const hasPhone = data.phone !== undefined;
    const hasAddress = data.address !== undefined;
    const hasUsedPoint = data.usedPoint !== undefined;

    if (!hasPhone && !hasAddress && !hasUsedPoint) {
      return order;
    }

    const updatedOrder = await this.prisma.$transaction(async (prisma) => {
      const updateData: Record<string, unknown> = {};

      if (hasPhone) {
        updateData.phone = data.phone;
      }

      if (hasAddress) {
        updateData.address = data.address;
      }

      if (hasUsedPoint) {
        const nextUsedPoint = data.usedPoint ?? 0;

        if (nextUsedPoint < 0) {
          throw new BadRequestException('usedPoint cannot be negative');
        }

        const user = await prisma.user.findUnique({
          where: { id: order.userId },
        });

        if (!user) {
          throw new BadRequestException('User not found');
        }

        const availablePoints = user.loyaltyPoint + order.usedPoint;

        if (nextUsedPoint > availablePoints) {
          throw new BadRequestException('Not enough loyalty points');
        }

        // Tính lại subtotal từ item, không lấy order.total + usedPoint
        // vì order.total đã bị ảnh hưởng bởi discountAmount cũ
        const subtotal = order.items.reduce((sum, item) => {
          return sum + item.basePrice * item.quantity;
        }, 0);

        const completedOrdersTotal =
          await this.getUserTierFromCompletedOrders(order.userId);

        const discountPercentage =
          getDiscountPercentageByTier(completedOrdersTotal);

        const newDiscountAmount = Math.floor(subtotal * discountPercentage);

        const maxAllowedDiscount = subtotal - newDiscountAmount;

        if (nextUsedPoint > maxAllowedDiscount) {
          throw new BadRequestException(
            `usedPoint (${nextUsedPoint}) cannot exceed ${maxAllowedDiscount} (subtotal - tier discount)`,
          );
        }

        const pointDifference = nextUsedPoint - order.usedPoint;

        const newTotal = Math.max(
          0,
          subtotal - nextUsedPoint - newDiscountAmount,
        );

        // Điểm tích lũy = 10% tổng tiền thanh toán cuối cùng
        const newEarnedPoint = Math.floor(newTotal * 0.1);

        // Nếu tăng số điểm dùng thì trừ thêm
        if (pointDifference > 0) {
          await prisma.user.update({
            where: { id: order.userId },
            data: {
              loyaltyPoint: { decrement: pointDifference },
            },
          });
        }

        // Nếu giảm số điểm dùng thì hoàn lại
        if (pointDifference < 0) {
          await prisma.user.update({
            where: { id: order.userId },
            data: {
              loyaltyPoint: { increment: Math.abs(pointDifference) },
            },
          });
        }

        updateData.usedPoint = nextUsedPoint;
        updateData.total = newTotal;
        updateData.earnedPoint = newEarnedPoint;
      }

      const updated = await prisma.order.update({
        where: { id },
        data: updateData,
        include: this.orderInclude,
      });

      if (hasUsedPoint) {
        await prisma.payment.updateMany({
          where: {
            orderId: id,
            status: 'PENDING',
          },
          data: {
            amount: updated.total,
          },
        });

        await prisma.orderLog.create({
          data: {
            orderId: id,
            status: 'PENDING',
            note: `Updated loyalty points usage from ${order.usedPoint} to ${updated.usedPoint}`,
          },
        });
      }

      return updated;
    });

    this.ordersGateway.emitOrderUpdated(updatedOrder);
    return updatedOrder;
  }
}