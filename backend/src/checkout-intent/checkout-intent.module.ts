import { Module } from '@nestjs/common';
import { CheckoutIntentController } from './checkout-intent.controller';
import { CheckoutIntentService } from './checkout-intent.service';

@Module({
  controllers: [CheckoutIntentController],
  providers: [CheckoutIntentService],
})
export class CheckoutIntentModule {}
