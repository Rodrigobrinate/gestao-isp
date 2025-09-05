-- CreateEnum
CREATE TYPE "public"."TipoProduto" AS ENUM ('SERIALIZADO', 'QUANTIDADE');

-- CreateEnum
CREATE TYPE "public"."CondicaoItem" AS ENUM ('NOVO', 'REUTILIZADO');

-- CreateEnum
CREATE TYPE "public"."StatusItem" AS ENUM ('EM_ESTOQUE', 'ALOCADO', 'INSTALADO', 'DEFEITUOSO', 'EM_REPARO');

-- CreateTable
CREATE TABLE "public"."Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Localizacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Localizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sku" TEXT,
    "descricao" TEXT,
    "tipo" "public"."TipoProduto" NOT NULL,
    "tempoEntrega" INTEGER,
    "categoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntradaEstoque" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "dataChegada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroNotaFiscal" TEXT NOT NULL,
    "fornecedor" TEXT,
    "produtoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntradaEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemEstoque" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT,
    "condicao" "public"."CondicaoItem" NOT NULL,
    "status" "public"."StatusItem" NOT NULL DEFAULT 'EM_ESTOQUE',
    "produtoId" TEXT NOT NULL,
    "localizacaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "public"."Categoria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Localizacao_nome_key" ON "public"."Localizacao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_sku_key" ON "public"."Produto"("sku");

-- CreateIndex
CREATE INDEX "Produto_categoriaId_idx" ON "public"."Produto"("categoriaId");

-- CreateIndex
CREATE INDEX "EntradaEstoque_produtoId_idx" ON "public"."EntradaEstoque"("produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemEstoque_serialNumber_key" ON "public"."ItemEstoque"("serialNumber");

-- CreateIndex
CREATE INDEX "ItemEstoque_produtoId_idx" ON "public"."ItemEstoque"("produtoId");

-- CreateIndex
CREATE INDEX "ItemEstoque_localizacaoId_idx" ON "public"."ItemEstoque"("localizacaoId");

-- AddForeignKey
ALTER TABLE "public"."Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntradaEstoque" ADD CONSTRAINT "EntradaEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemEstoque" ADD CONSTRAINT "ItemEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemEstoque" ADD CONSTRAINT "ItemEstoque_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "public"."Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
