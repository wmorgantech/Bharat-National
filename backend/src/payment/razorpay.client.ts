import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { requireEnv } from '../config/env';

export interface RazorpayOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
}

@Injectable()
export class RazorpayClient {
  private client?: Razorpay;
  private keyId?: string;

  private getClient(): Razorpay {
    if (!this.client) {
      this.keyId = requireEnv('RAZORPAY_KEY_ID');
      this.client = new Razorpay({
        key_id: this.keyId,
        key_secret: requireEnv('RAZORPAY_KEY_SECRET'),
      });
    }

    return this.client;
  }

  getKeyId(): string {
    this.getClient();
    return this.keyId!;
  }

  createOrder(request: RazorpayOrderRequest) {
    return this.getClient().orders.create(request);
  }
}