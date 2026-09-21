import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';
import { SKIP_ALL_THROTTLES } from './common/throttle.config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Acts as the health endpoint; a load balancer polling it should not consume
  // the global rate-limit budget.
  @Public()
  @SkipThrottle(SKIP_ALL_THROTTLES)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
