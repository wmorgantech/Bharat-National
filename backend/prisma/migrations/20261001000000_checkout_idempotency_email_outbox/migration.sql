ALTER TABLE "Order" ADD COLUMN "checkoutKey" TEXT;
ALTER TABLE "Order" ADD COLUMN "checkoutFingerprint" TEXT;

CREATE UNIQUE INDEX "Order_userId_checkoutKey_key"
ON "Order"("userId", "checkoutKey");

CREATE UNIQUE INDEX "Order_userId_checkoutFingerprint_key"
ON "Order"("userId", "checkoutFingerprint");

CREATE TABLE "OrderConfirmationOutbox" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderConfirmationOutbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderConfirmationOutbox_orderId_key"
ON "OrderConfirmationOutbox"("orderId");

CREATE INDEX "OrderConfirmationOutbox_status_nextAttemptAt_idx"
ON "OrderConfirmationOutbox"("status", "nextAttemptAt");

ALTER TABLE "OrderConfirmationOutbox"
ADD CONSTRAINT "OrderConfirmationOutbox_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;