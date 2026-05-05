import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
  Req,
  Res,
  Param,
  ParseIntPipe,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { VNPayService } from './vnpay.service.js';
import { OrdersGateway } from '../orders/orders.gateway.js';
import { OrdersService } from '../orders/orders.service.js';
import { CreateOrderDto } from '../orders/dto/create-orders.dto.js';

interface CreateVNPayPaymentDto {
  orderId: number;
  amount?: number;
  orderDescription?: string;
}

interface CreatePaymentSessionDto {
  orderId: number;
  method: 'cod' | 'vnpay' | 'CASH' | 'VNPAY';
  orderDescription?: string;
}

interface InitiateVNPayCheckoutDto {
  checkoutData: CreateOrderDto;
}

@Controller('payments')
export class PaymentsController {
  private readonly RETURN_URL = process.env.VNP_RETURN_URL || '';
  private readonly FRONTEND_SUCCESS_URL =
    process.env.FRONTEND_PAYMENT_SUCCESS_URL ||
    'http://localhost:5173/checkout/success';
  private readonly FRONTEND_FAILED_URL =
    process.env.FRONTEND_PAYMENT_FAILED_URL ||
    'http://localhost:5173/checkout/failed';

  constructor(
    private readonly vnpayService: VNPayService,
    private readonly prisma: PrismaService,
    private readonly ordersGateway: OrdersGateway,
    private readonly ordersService: OrdersService,
  ) { }

  @Post('vnpay/initiate')
  async initiateVNPayCheckout(
    @Body() data: InitiateVNPayCheckoutDto,
    @Req() req: Request,
  ) {
    try {
      const { checkoutData } = data;

      if (!checkoutData || !checkoutData.userId || !checkoutData.phone || !checkoutData.address) {
        throw new BadRequestException('Invalid checkout payload');
      }

      if (!Array.isArray(checkoutData.items) || checkoutData.items.length === 0) {
        throw new BadRequestException('Order must contain at least one item');
      }

      if (!this.RETURN_URL) {
        throw new InternalServerErrorException('VNP_RETURN_URL is missing');
      }

      const createdOrder = await this.ordersService.create({
        ...checkoutData,
        paymentMethod: 'VNPAY',
      });

      const paymentUrl = this.vnpayService.createPaymentUrl({
        orderCode: createdOrder.id,
        amount: createdOrder.total,
        orderDescription: `Thanh toán đơn hàng #${createdOrder.id}`,
        returnUrl: this.RETURN_URL,
        ipAddress: this.getIpAddress(req),
      });

      return {
        success: true,
        method: 'VNPAY',
        orderId: createdOrder.id,
        amount: createdOrder.total,
        paymentUrl,
        nextAction: 'REDIRECT',
      };
    } catch (error: unknown) {
      console.error('VNPay initiate checkout failed:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2021'
      ) {
        throw new InternalServerErrorException(
          'Database table is missing. Run Prisma migrations.',
        );
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected error while creating VNPay checkout session';

      throw new InternalServerErrorException(message);
    }
  }

  @Post('checkout')
  async createPaymentSession(
    @Body() data: CreatePaymentSessionDto,
    @Req() req: Request,
  ) {
    const { orderId } = data;
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const normalizedMethod = this.normalizePaymentMethod(data.method);

    if (normalizedMethod === 'CASH') {
      const payment = await this.upsertPayment(orderId, 'CASH', order.total);
      return {
        success: true,
        method: 'COD',
        paymentId: payment.id,
        nextAction: 'NONE',
      };
    }

    if (normalizedMethod === 'VNPAY') {
      const payment = await this.upsertPayment(orderId, 'VNPAY', order.total);
      const paymentUrl = this.vnpayService.createPaymentUrl({
        orderCode: orderId,
        amount: order.total,
        orderDescription:
          data.orderDescription || `Thanh toán đơn hàng #${orderId}`,
        returnUrl: this.RETURN_URL,
        ipAddress: this.getIpAddress(req),
      });

      return {
        success: true,
        method: 'VNPAY',
        paymentId: payment.id,
        paymentUrl,
        nextAction: 'REDIRECT',
      };
    }

    throw new BadRequestException(
      `Unsupported payment method: ${data.method}`,
    );
  }

  /**
   * Create VNPay payment URL for order
   */
  @Post('vnpay/create')
  async createVNPayPayment(
    @Body() data: CreateVNPayPaymentDto,
    @Req() req: Request,
  ) {
    return this.createPaymentSession(
      {
        orderId: data.orderId,
        method: 'vnpay',
        orderDescription:
          data.orderDescription || `Thanh toán đơn hàng #${data.orderId}`,
      },
      req,
    );
  }

  /**
   * Retry payment for an existing order (if previous attempt failed)
   */
  @Post('retry/:orderId')
  async retryPayment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() data: { method?: 'cod' | 'vnpay' | 'CASH' | 'VNPAY' },
    @Req() req: Request,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, payments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'Can only retry payment for orders in PENDING status'
      );
    }

    // Get the last payment to determine method
    const lastPayment = order.payments?.[order.payments.length - 1];
    if (!lastPayment) {
      throw new NotFoundException('No payment record found for this order');
    }

    const paymentMethod = data.method
      ? this.normalizePaymentMethod(data.method)
      : lastPayment.method;

    if (paymentMethod === 'CASH') {
      const payment = await this.upsertPayment(orderId, 'CASH', order.total);
      return {
        success: true,
        method: 'COD',
        paymentId: payment.id,
        nextAction: 'NONE',
      };
    }

    if (paymentMethod === 'VNPAY') {
      const payment = await this.upsertPayment(orderId, 'VNPAY', order.total);
      const paymentUrl = this.vnpayService.createPaymentUrl({
        orderCode: orderId,
        amount: order.total,
        orderDescription: `Thanh toán lại đơn hàng #${orderId}`,
        returnUrl: this.RETURN_URL,
        ipAddress: this.getIpAddress(req),
      });

      return {
        success: true,
        method: 'VNPAY',
        paymentId: payment.id,
        paymentUrl,
        nextAction: 'REDIRECT',
      };
    }

    throw new BadRequestException(
      `Unsupported payment method: ${paymentMethod}`
    );
  }

  /**
   * Handle VNPay IPN callback
   */
  @Post('vnpay/ipn')
  async handleVNPayCallback(@Query() queryData: Record<string, unknown>) {
    const verify = this.vnpayService.verifyIpnCall(queryData);
    const callbackData = verify;

    // Verify signature
    if (!verify.isVerified) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const txnRef = String(callbackData.vnp_TxnRef ?? '');
    const orderId = Number(txnRef);
    const paymentAmount = Number(callbackData.vnp_Amount);

    if (!txnRef) {
      return { RspCode: '01', Message: 'Invalid transaction reference' };
    }

    if (!Number.isInteger(orderId)) {
      return { RspCode: '01', Message: 'Invalid order reference' };
    }

    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
          logs: true,
        },
      });

      if (!order) {
        return { RspCode: '01', Message: 'Order not found' };
      }

      if (paymentAmount !== order.total) {
        return { RspCode: '04', Message: 'Invalid amount' };
      }

      const payment = await this.prisma.payment.findFirst({
        where: {
          orderId,
          method: 'VNPAY',
        },
      });

      if (!payment) {
        return { RspCode: '01', Message: 'Payment not found' };
      }

      if (payment.status === 'SUCCESS') {
        return { RspCode: '02', Message: 'Order already confirmed' };
      }

      if (callbackData.isSuccess) {
        await this.prisma.payment.updateMany({
          where: {
            orderId,
            method: 'VNPAY',
          },
          data: {
            status: 'SUCCESS',
            transactionId: String(callbackData.vnp_TransactionNo ?? ''),
            paidAt: new Date(),
          },
        });

        const visibleOrder = await this.prisma.order.findUnique({
          where: { id: orderId },
          include: {
            user: true,
            items: {
              include: {
                product: true,
              },
            },
            payments: true,
            logs: true,
          },
        });

        if (visibleOrder) {
          this.ordersGateway.emitOrderUpdated(visibleOrder);
        }

        return { RspCode: '00', Message: 'Successfully confirmed payment' };
      }

      await this.prisma.payment.updateMany({
        where: {
          orderId,
          method: 'VNPAY',
        },
        data: {
          status: 'FAILED',
          transactionId: String(callbackData.vnp_TransactionNo ?? ''),
        },
      });

      await this.cancelOrderOnVNPayFailure(orderId);

      return { RspCode: '01', Message: 'Payment failed' };
    } catch (error) {
      console.error('Error processing VNPay callback:', error);
      return { RspCode: '99', Message: 'System error' };
    }
  }

  /**
   * Return URL after payment attempt (user redirect)
   */
  @Get('vnpay/return')
  async handleVNPayReturn(
    @Query() queryData: Record<string, unknown>,
    @Res() res: Response,
  ) {
    const verify = this.vnpayService.verifyReturnUrl(queryData);

    // Verify signature
    if (!verify.isVerified) {
      return res.redirect(
        `${this.FRONTEND_FAILED_URL}?error=invalid_signature`,
      );
    }

    const txnRef = String(verify.vnp_TxnRef ?? '');
    const orderId = Number(txnRef);
    if (!Number.isInteger(orderId)) {
      return res.redirect(`${this.FRONTEND_FAILED_URL}?error=invalid_order_ref`);
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, total: true },
    });

    if (!order) {
      return res.redirect(
        `${this.FRONTEND_FAILED_URL}?orderId=${orderId}&error=order_not_found`,
      );
    }

    const paymentAmount = Number(verify.vnp_Amount);
    if (Number.isFinite(paymentAmount) && paymentAmount !== order.total) {
      return res.redirect(
        `${this.FRONTEND_FAILED_URL}?orderId=${orderId}&error=invalid_amount`,
      );
    }

    // Check payment status
    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        method: 'VNPAY',
      },
    });

    if (!payment) {
      return res.redirect(
        `${this.FRONTEND_FAILED_URL}?error=payment_not_found`,
      );
    }

    if (verify.isSuccess && payment.status !== 'SUCCESS') {
      await this.prisma.payment.updateMany({
        where: {
          orderId,
          method: 'VNPAY',
        },
        data: {
          status: 'SUCCESS',
          transactionId: String(verify.vnp_TransactionNo ?? ''),
          paidAt: new Date(),
        },
      });

      await this.emitOrderUpdated(orderId);
    }

    if (!verify.isSuccess && payment.status === 'PENDING') {
      await this.prisma.payment.updateMany({
        where: {
          orderId,
          method: 'VNPAY',
        },
        data: {
          status: 'FAILED',
          transactionId: String(verify.vnp_TransactionNo ?? ''),
        },
      });

      await this.cancelOrderOnVNPayFailure(orderId);
    }

    // Redirect to appropriate page
    if (verify.isSuccess) {
      return res.redirect(
        `${this.FRONTEND_SUCCESS_URL}?orderId=${orderId}&transactionId=${verify.vnp_TransactionNo}&status=success`,
      );
    } else {
      return res.redirect(
        `${this.FRONTEND_FAILED_URL}?orderId=${orderId}&error=payment_failed`,
      );
    }
  }

  private getIpAddress(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return this.normalizeIpAddress(forwarded.split(',')[0]?.trim() || '');
    }
    return this.normalizeIpAddress(req.socket.remoteAddress || '127.0.0.1');
  }

  private normalizeIpAddress(ip: string): string {
    if (!ip || ip === '::1' || ip === '::') {
      return '127.0.0.1';
    }

    if (ip.startsWith('::ffff:')) {
      return ip.replace('::ffff:', '');
    }

    return ip;
  }

  private normalizePaymentMethod(
    method: CreatePaymentSessionDto['method'],
  ): PaymentMethod {
    const normalized = method.toUpperCase();

    if (normalized === 'COD' || normalized === 'CASH') {
      return 'CASH';
    }

    if (normalized === 'VNPAY') {
      return 'VNPAY';
    }

    throw new BadRequestException(`Unsupported payment method: ${method}`);
  }

  private async cancelOrderOnVNPayFailure(orderId: number): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      return;
    }

    if (order.status === 'PENDING') {
      await this.ordersService.updateStatus(orderId, 'CANCELLED');
      return;
    }

    await this.emitOrderUpdated(orderId);
  }

  private async upsertPayment(
    orderId: number,
    method: PaymentMethod,
    amount: number,
  ) {
    const existing = await this.prisma.payment.findFirst({
      where: {
        orderId,
        method,
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (!existing) {
      return this.prisma.payment.create({
        data: {
          orderId,
          method,
          status: 'PENDING',
          amount,
        },
      });
    }

    return this.prisma.payment.update({
      where: { id: existing.id },
      data: {
        amount,
        status: 'PENDING',
        transactionId: null,
        paidAt: null,
      },
    });
  }

  private async emitOrderUpdated(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        logs: true,
      },
    });

    if (order) {
      this.ordersGateway.emitOrderUpdated(order);
    }
  }

}
