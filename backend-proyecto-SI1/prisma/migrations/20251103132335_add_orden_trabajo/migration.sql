-- CreateEnum
CREATE TYPE "estado_orden" AS ENUM ('ABIERTA', 'EN_PROCESO', 'FINALIZADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "orden_trabajo" (
    "id" SERIAL NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "estado" "estado_orden" NOT NULL DEFAULT 'ABIERTA',
    "empleado_ci" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "detalle_id" INTEGER,

    CONSTRAINT "orden_trabajo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orden_trabajo" ADD CONSTRAINT "orden_trabajo_empleado_ci_fkey" FOREIGN KEY ("empleado_ci") REFERENCES "EMPLEADO"("CI") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_trabajo" ADD CONSTRAINT "orden_trabajo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "USUARIO"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_trabajo" ADD CONSTRAINT "orden_trabajo_detalle_id_fkey" FOREIGN KEY ("detalle_id") REFERENCES "DETALLE_PROFORMA"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
