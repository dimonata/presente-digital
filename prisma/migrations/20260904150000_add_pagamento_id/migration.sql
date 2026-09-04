ALTER TABLE "Presente" ADD COLUMN "pagamentoId" TEXT;

CREATE UNIQUE INDEX "Presente_pagamentoId_key" ON "Presente"("pagamentoId");
