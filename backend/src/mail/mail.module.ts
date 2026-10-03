import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { OrderConfirmationOutboxService } from './order-confirmation-outbox.service';

@Module({
  providers: [MailService, OrderConfirmationOutboxService],
  exports: [MailService, OrderConfirmationOutboxService],
})
export class MailModule {}
