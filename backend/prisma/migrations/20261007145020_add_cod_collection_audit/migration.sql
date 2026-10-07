-- CreateTable
CREATE TABLE "CodCollectionEvent" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodCollectionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodCollectionEvent_orderId_key" ON "CodCollectionEvent"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CodCollectionEvent_paymentId_key" ON "CodCollectionEvent"("paymentId");

-- CreateIndex
CREATE INDEX "CodCollectionEvent_adminId_collectedAt_idx" ON "CodCollectionEvent"("adminId", "collectedAt");

-- AddForeignKey
ALTER TABLE "CodCollectionEvent" ADD CONSTRAINT "CodCollectionEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodCollectionEvent" ADD CONSTRAINT "CodCollectionEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodCollectionEvent" ADD CONSTRAINT "CodCollectionEvent_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
