-- CreateEnum
CREATE TYPE "estado_pago" AS ENUM ('PENDIENTE', 'PAGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "comision" (
    "id" SERIAL NOT NULL,
    "orden_id" INTEGER,
    "monto" DECIMAL(12,2) NOT NULL,
    "estado_pago" "estado_pago" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_pago" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comision_orden_id_key" ON "comision"("orden_id");

-- AddForeignKey
ALTER TABLE "comision" ADD CONSTRAINT "comision_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "orden_trabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
