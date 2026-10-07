-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "checkoutIntentId" INTEGER,
ALTER COLUMN "orderId" DROP NOT NULL,
ALTER COLUMN "razorpayOrderId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CheckoutIntent" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "pincode" TEXT,
    "state" TEXT,
    "place" TEXT NOT NULL,
    "checkoutKey" TEXT NOT NULL,
    "checkoutFingerprint" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "finalOrderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutIntentItem" (
    "id" SERIAL NOT NULL,
    "intentId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutIntentItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutIntent_finalOrderId_key" ON "CheckoutIntent"("finalOrderId");

-- CreateIndex
CREATE INDEX "CheckoutIntent_userId_status_idx" ON "CheckoutIntent"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutIntent_userId_checkoutKey_key" ON "CheckoutIntent"("userId", "checkoutKey");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutIntent_userId_checkoutFingerprint_key" ON "CheckoutIntent"("userId", "checkoutFingerprint");

-- CreateIndex
CREATE INDEX "CheckoutIntentItem_intentId_idx" ON "CheckoutIntentItem"("intentId");

-- CreateIndex
CREATE INDEX "CheckoutIntentItem_productId_idx" ON "CheckoutIntentItem"("productId");

-- CreateIndex
CREATE INDEX "Payment_checkoutIntentId_idx" ON "Payment"("checkoutIntentId");

-- AddForeignKey
ALTER TABLE "CheckoutIntent" ADD CONSTRAINT "CheckoutIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutIntent" ADD CONSTRAINT "CheckoutIntent_finalOrderId_fkey" FOREIGN KEY ("finalOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutIntentItem" ADD CONSTRAINT "CheckoutIntentItem_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "CheckoutIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutIntentItem" ADD CONSTRAINT "CheckoutIntentItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_checkoutIntentId_fkey" FOREIGN KEY ("checkoutIntentId") REFERENCES "CheckoutIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

