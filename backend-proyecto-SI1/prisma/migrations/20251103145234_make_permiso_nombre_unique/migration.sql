/*
  Warnings:

  - A unique constraint covering the columns `[NOMBRE]` on the table `PERMISO` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PERMISO_NOMBRE_key" ON "PERMISO"("NOMBRE");
