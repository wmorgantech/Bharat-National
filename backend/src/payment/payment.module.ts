import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { RazorpayClient } from './razorpay.client';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, RazorpayClient],
})
export class PaymentModule {}