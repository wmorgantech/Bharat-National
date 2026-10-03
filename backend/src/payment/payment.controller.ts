import {
  Controller,
  ForbiddenException,
  Headers,
  Post,
  Req,
  Request,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  PAYMENT_CREATE_THROTTLE,
  PAYMENT_VERIFY_THROTTLE,
} from '../common/throttle.config';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { PaymentService } from './payment.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
  @ApiBearerAuth()
  @Throttle(PAYMENT_CREATE_THROTTLE)
  createOrder(@Body() dto: CreatePaymentOrderDto, @Request() request) {
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }
    if (request.user.type !== 'USER') {
      throw new ForbiddenException('User access required');
    }

    return this.paymentService.createOrder(dto, request.user);
  }

  @Post('verify')
  @ApiBearerAuth()
  @Throttle(PAYMENT_VERIFY_THROTTLE)
  verify(@Body() dto: VerifyPaymentDto, @Request() request) {
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }
    if (request.user.type !== 'USER') {
      throw new ForbiddenException('User access required');
    }

    return this.paymentService.verifyPayment(dto, request.user);
  }

  @Post('webhook')
  @Public()
  webhook(
    @Req() request: RawBodyRequest<ExpressRequest>,
    @Headers('x-razorpay-signature') signature: string,
    @Headers('x-razorpay-event-id') eventId: string,
  ) {
    return this.paymentService.handleWebhook(
      request.rawBody,
      signature,
      eventId,
    );
  }
}
