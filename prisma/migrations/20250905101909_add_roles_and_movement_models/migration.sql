-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'ALMOXARIFADO', 'GERENTE_REGIONAL', 'TECNICO');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE "public"."Solicitacao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Movimentacao" (
    "id" TEXT NOT NULL,
    "itemEstoqueId" TEXT NOT NULL,
    "origemId" TEXT NOT NULL,
    "destinoId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Solicitacao_produtoId_idx" ON "public"."Solicitacao"("produtoId");

-- CreateIndex
CREATE INDEX "Solicitacao_solicitanteId_idx" ON "public"."Solicitacao"("solicitanteId");

-- CreateIndex
CREATE INDEX "Movimentacao_itemEstoqueId_idx" ON "public"."Movimentacao"("itemEstoqueId");

-- CreateIndex
CREATE INDEX "Movimentacao_origemId_idx" ON "public"."Movimentacao"("origemId");

-- CreateIndex
CREATE INDEX "Movimentacao_destinoId_idx" ON "public"."Movimentacao"("destinoId");

-- CreateIndex
CREATE INDEX "Movimentacao_responsavelId_idx" ON "public"."Movimentacao"("responsavelId");

-- AddForeignKey
ALTER TABLE "public"."Solicitacao" ADD CONSTRAINT "Solicitacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Solicitacao" ADD CONSTRAINT "Solicitacao_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimentacao" ADD CONSTRAINT "Movimentacao_itemEstoqueId_fkey" FOREIGN KEY ("itemEstoqueId") REFERENCES "public"."ItemEstoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimentacao" ADD CONSTRAINT "Movimentacao_origemId_fkey" FOREIGN KEY ("origemId") REFERENCES "public"."Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimentacao" ADD CONSTRAINT "Movimentacao_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "public"."Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movimentacao" ADD CONSTRAINT "Movimentacao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
