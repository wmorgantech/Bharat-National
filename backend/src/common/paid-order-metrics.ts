import { Prisma } from '@prisma/client';

export const PAID_ORDER_WHERE = {
  paymentStatus: 'PAID',
  status: { not: 'CANCELLED' },
  isActive: true,
} satisfies Prisma.OrderWhereInput;

export function isPaidFinancialOrder(order: {
  paymentStatus: string;
  status: string;
  isActive: boolean;
}): boolean {
  return (
    order.paymentStatus === 'PAID' &&
    order.status !== 'CANCELLED' &&
    order.isActive
  );
}
