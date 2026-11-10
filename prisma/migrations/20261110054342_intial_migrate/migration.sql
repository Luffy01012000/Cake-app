-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SEO_SPECIALIST');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SEO_SPECIALIST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cake" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL DEFAULT '',
    "imageCaption" TEXT,
    "finishColor" TEXT NOT NULL DEFAULT '#f0e4d3',
    "swatchName" TEXT NOT NULL DEFAULT 'Starlight',
    "servings" TEXT NOT NULL,
    "tiers" INTEGER NOT NULL DEFAULT 1,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "flavors" TEXT[],
    "description" TEXT NOT NULL,
    "tastingNotes" TEXT[],
    "dimensions" TEXT NOT NULL,
    "leadTime" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "ogImage" TEXT,
    "rawJsonLd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CakeFaq" (
    "id" TEXT NOT NULL,
    "cakeId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CakeFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSeo" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "ogImage" TEXT,
    "rawJsonLd" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageFaq" (
    "id" TEXT NOT NULL,
    "pageSeoId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RobotsConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "gptBotAllowed" BOOLEAN NOT NULL DEFAULT true,
    "perplexityBotAllowed" BOOLEAN NOT NULL DEFAULT true,
    "claudeBotAllowed" BOOLEAN NOT NULL DEFAULT true,
    "googleExtendedAllowed" BOOLEAN NOT NULL DEFAULT true,
    "ccBotAllowed" BOOLEAN NOT NULL DEFAULT true,
    "customRules" TEXT DEFAULT '',
    "sitemapUrl" TEXT DEFAULT '/sitemap.xml',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RobotsConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'AURA Patisserie',
    "siteUrl" TEXT NOT NULL DEFAULT 'https://aurapatisserie.com',
    "siteDescription" TEXT NOT NULL DEFAULT 'Architectural Haute Patisserie & Bespoke Luxury Cakes',
    "logoUrl" TEXT NOT NULL DEFAULT '/images/wedding_cake.jpg',
    "contactEmail" TEXT NOT NULL DEFAULT 'concierge@aurapatisserie.com',
    "contactPhone" TEXT NOT NULL DEFAULT '+1 (800) 555-AURA',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "botName" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "cakeId" TEXT NOT NULL,
    "cakeName" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "OrderStatus" NOT NULL DEFAULT 'ACTIVE',
    "deliveryDate" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cake_slug_key" ON "Cake"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PageSeo_path_key" ON "PageSeo"("path");

-- CreateIndex
CREATE INDEX "Visit_createdAt_idx" ON "Visit"("createdAt");

-- CreateIndex
CREATE INDEX "Visit_isBot_idx" ON "Visit"("isBot");

-- CreateIndex
CREATE INDEX "Visit_path_idx" ON "Visit"("path");

-- CreateIndex
CREATE INDEX "Order_cakeId_idx" ON "Order"("cakeId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- AddForeignKey
ALTER TABLE "CakeFaq" ADD CONSTRAINT "CakeFaq_cakeId_fkey" FOREIGN KEY ("cakeId") REFERENCES "Cake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageFaq" ADD CONSTRAINT "PageFaq_pageSeoId_fkey" FOREIGN KEY ("pageSeoId") REFERENCES "PageSeo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
