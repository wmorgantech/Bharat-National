import {
  Controller,
  ForbiddenException,
  Post,
  Request,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  PAYMENT_CREATE_THROTTLE,
  PAYMENT_VERIFY_THROTTLE,
} from '../common/throttle.config';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { PaymentService } from './payment.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
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
}