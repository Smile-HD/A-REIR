/*
  Warnings:

  - The primary key for the `DETALLE_PROFORMA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `SUBTOTAL` on the `DETALLE_PROFORMA` table. All the data in the column will be lost.
  - You are about to alter the column `ID` on the `DETALLE_PROFORMA` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `DESCRIPCION` on the `DETALLE_PROFORMA` table. The data in that column could be lost. The data in that column will be cast from `VarChar(250)` to `VarChar(100)`.
  - You are about to drop the column `FECHANAC` on the `EMPLEADO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_USUARIO` on the `EMPLEADO` table. All the data in the column will be lost.
  - The primary key for the `PROFORMA_REPUESTO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `PROFORMA_REPUESTO` table. All the data in the column will be lost.
  - You are about to alter the column `NOMBRE` on the `PROFORMA_REPUESTO` table. The data in that column could be lost. The data in that column will be cast from `VarChar(120)` to `VarChar(100)`.
  - A unique constraint covering the columns `[EMPLEADO_CI]` on the table `USUARIO` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DETALLE_PROFORMA" DROP CONSTRAINT "DETALLE_PROFORMA_SERVICIO_ID_fkey";

-- DropForeignKey
ALTER TABLE "EMPLEADO" DROP CONSTRAINT "EMPLEADO_ID_USUARIO_fkey";

-- DropForeignKey
ALTER TABLE "PROFORMA_REPUESTO" DROP CONSTRAINT "PROFORMA_REPUESTO_PROFORMA_ID_fkey";

-- DropIndex
DROP INDEX "EMPLEADO_ID_USUARIO_key";

-- AlterTable
ALTER TABLE "DETALLE_PROFORMA" DROP CONSTRAINT "DETALLE_PROFORMA_pkey",
DROP COLUMN "SUBTOTAL",
ALTER COLUMN "ID" DROP DEFAULT,
ALTER COLUMN "ID" SET DATA TYPE INTEGER,
ALTER COLUMN "DESCRIPCION" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "CANTIDAD" SET DATA TYPE DECIMAL(12,2);

-- CreateSequence for ID
CREATE SEQUENCE IF NOT EXISTS "DETALLE_PROFORMA_ID_seq";
ALTER TABLE "DETALLE_PROFORMA" ALTER COLUMN "ID" SET DEFAULT nextval('"DETALLE_PROFORMA_ID_seq"');
ALTER SEQUENCE "DETALLE_PROFORMA_ID_seq" OWNED BY "DETALLE_PROFORMA"."ID";

-- Add Primary Key
ALTER TABLE "DETALLE_PROFORMA" ADD CONSTRAINT "DETALLE_PROFORMA_pkey" PRIMARY KEY ("ID");

-- AlterTable
ALTER TABLE "EMPLEADO" DROP COLUMN "FECHANAC",
DROP COLUMN "ID_USUARIO",
ALTER COLUMN "NOMBRE" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "DIRECCION" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "TELEFONO" SET DATA TYPE VARCHAR(15);

-- AlterTable
ALTER TABLE "PROFORMA_REPUESTO" DROP CONSTRAINT "PROFORMA_REPUESTO_pkey",
DROP COLUMN "ID",
ALTER COLUMN "NOMBRE" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "PROFORMA_REPUESTO_pkey" PRIMARY KEY ("PROFORMA_ID", "NOMBRE");

-- AlterTable
ALTER TABLE "USUARIO" ADD COLUMN     "EMPLEADO_CI" INTEGER;

-- CreateTable
CREATE TABLE "HORARIO" (
    "ID" SERIAL NOT NULL,
    "HORA_INICIO" TIME NOT NULL,
    "HORA_FIN" TIME NOT NULL,

    CONSTRAINT "HORARIO_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "HORARIO_EMPLEADO" (
    "EMPLEADO_CI" INTEGER NOT NULL,
    "HORARIO_ID" INTEGER NOT NULL,
    "FECHA" DATE NOT NULL,

    CONSTRAINT "HORARIO_EMPLEADO_pkey" PRIMARY KEY ("EMPLEADO_CI","HORARIO_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "USUARIO_EMPLEADO_CI_key" ON "USUARIO"("EMPLEADO_CI");

-- AddForeignKey
ALTER TABLE "USUARIO" ADD CONSTRAINT "USUARIO_EMPLEADO_CI_fkey" FOREIGN KEY ("EMPLEADO_CI") REFERENCES "EMPLEADO"("CI") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PROFORMA_REPUESTO" ADD CONSTRAINT "PROFORMA_REPUESTO_PROFORMA_ID_fkey" FOREIGN KEY ("PROFORMA_ID") REFERENCES "PROFORMA"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_PROFORMA" ADD CONSTRAINT "DETALLE_PROFORMA_SERVICIO_ID_fkey" FOREIGN KEY ("SERVICIO_ID") REFERENCES "SERVICIO"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HORARIO_EMPLEADO" ADD CONSTRAINT "HORARIO_EMPLEADO_EMPLEADO_CI_fkey" FOREIGN KEY ("EMPLEADO_CI") REFERENCES "EMPLEADO"("CI") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HORARIO_EMPLEADO" ADD CONSTRAINT "HORARIO_EMPLEADO_HORARIO_ID_fkey" FOREIGN KEY ("HORARIO_ID") REFERENCES "HORARIO"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
