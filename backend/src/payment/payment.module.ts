import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { RazorpayClient } from './razorpay.client';

@Module({
  imports: [MailModule],
  controllers: [PaymentController],
  providers: [PaymentService, RazorpayClient],
})
export class PaymentModule {}