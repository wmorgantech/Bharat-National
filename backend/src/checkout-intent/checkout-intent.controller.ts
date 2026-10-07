import {
  Controller,
  ForbiddenException,
  Post,
  Request,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/jwt.strategy';
import { CreateCheckoutIntentDto } from './dto/create-checkout-intent.dto';
import { CheckoutIntentService } from './checkout-intent.service';

@ApiTags('CheckoutIntent')
@ApiBearerAuth()
@Controller('checkout-intents')
export class CheckoutIntentController {
  constructor(private readonly checkoutIntentService: CheckoutIntentService) {}

  @Post()
  create(
    @Body() dto: CreateCheckoutIntentDto,
    @Request() request: { user?: AuthUser },
  ) {
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }
    if (request.user.type !== 'USER') {
      throw new ForbiddenException('User access required');
    }

    return this.checkoutIntentService.create(dto, request.user);
  }
}
