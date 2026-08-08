-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "externalCustomerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "externalUserId" TEXT,
ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN "tenantId" INTEGER;

ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Drop unique on email alone (recreate as composite with tenant)
DROP INDEX IF EXISTS "User_email_key";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "tenantId" INTEGER;

-- CreateTable
CREATE TABLE "SsoState" (
    "id" TEXT NOT NULL,
    "codeVerifier" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "returnTo" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SsoState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthTicket" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_externalCustomerId_key" ON "Tenant"("externalCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_externalUserId_key" ON "User"("externalUserId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Company_tenantId_idx" ON "Company"("tenantId");

-- CreateIndex
CREATE INDEX "SsoState_expiresAt_idx" ON "SsoState"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthTicket_expiresAt_idx" ON "AuthTicket"("expiresAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
