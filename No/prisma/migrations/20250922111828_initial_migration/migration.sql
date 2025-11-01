-- CreateEnum
CREATE TYPE "public"."estado_orden" AS ENUM ('ABIERTA', 'EN_PROCESO', 'CERRADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "public"."estado_pago" AS ENUM ('PENDIENTE', 'PAGADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "public"."estado_proforma" AS ENUM ('PENDIENTE', 'APROBADA', 'ANULADA');

-- CreateTable
CREATE TABLE "public"."administrador" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categoria" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cliente" (
    "ci" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("ci")
);

-- CreateTable
CREATE TABLE "public"."comision" (
    "id" SERIAL NOT NULL,
    "orden_id" BIGINT,
    "monto" DECIMAL(12,2) NOT NULL,
    "estado_pago" "public"."estado_pago" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_pago" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "comision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."detalle_diagnostico" (
    "id" BIGSERIAL NOT NULL,
    "diagnostico_id" BIGINT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "detalle_diagnostico_pkey" PRIMARY KEY ("id","diagnostico_id")
);

-- CreateTable
CREATE TABLE "public"."detalle_proforma" (
    "id" BIGSERIAL NOT NULL,
    "proforma_id" BIGINT NOT NULL,
    "servicio_id" INTEGER,
    "descripcion" VARCHAR(250) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precio_unit" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2),

    CONSTRAINT "detalle_proforma_pkey" PRIMARY KEY ("id","proforma_id")
);

-- CreateTable
CREATE TABLE "public"."diagnostico" (
    "nro" BIGSERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME(6) NOT NULL,
    "placa_moto" VARCHAR(10) NOT NULL,
    "empleado_ci" INTEGER NOT NULL,

    CONSTRAINT "diagnostico_pkey" PRIMARY KEY ("nro")
);

-- CreateTable
CREATE TABLE "public"."empleado" (
    "ci" INTEGER NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "fechanac" DATE NOT NULL,
    "direccion" VARCHAR(200) NOT NULL,
    "telefono" INTEGER NOT NULL,

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("ci")
);

-- CreateTable
CREATE TABLE "public"."factura" (
    "id" BIGSERIAL NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_DATE,
    "cliente_ci" INTEGER NOT NULL,

    CONSTRAINT "factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."herramienta" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" VARCHAR(250),
    "marca_id" INTEGER NOT NULL,

    CONSTRAINT "herramienta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."horario" (
    "id" SERIAL NOT NULL,
    "hora_inicio" TIME(6) NOT NULL,
    "hora_fin" TIME(6) NOT NULL,

    CONSTRAINT "horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."horario_empleado" (
    "empleado_ci" INTEGER NOT NULL,
    "horario_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,

    CONSTRAINT "horario_empleado_pkey" PRIMARY KEY ("empleado_ci","horario_id")
);

-- CreateTable
CREATE TABLE "public"."marca_herramienta" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "marca_herramienta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marca_moto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "marca_moto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moto" (
    "placa" VARCHAR(10) NOT NULL,
    "modelo" TEXT NOT NULL,
    "year" SMALLINT NOT NULL,
    "chasis" TEXT,
    "marca_id" INTEGER NOT NULL,

    CONSTRAINT "moto_pkey" PRIMARY KEY ("placa")
);

-- CreateTable
CREATE TABLE "public"."movimiento_herramienta" (
    "herramienta_id" INTEGER NOT NULL,
    "orden_trabajo_id" BIGINT NOT NULL,
    "fecha" DATE NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "movimiento_herramienta_pkey" PRIMARY KEY ("orden_trabajo_id","herramienta_id")
);

-- CreateTable
CREATE TABLE "public"."orden_trabajo" (
    "id" BIGSERIAL NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "estado" "public"."estado_orden" NOT NULL DEFAULT 'ABIERTA',
    "empleado_ci" INTEGER NOT NULL,
    "administrador_id" INTEGER,
    "servicio_id" INTEGER NOT NULL,

    CONSTRAINT "orden_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proforma" (
    "id" BIGSERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" "public"."estado_proforma" NOT NULL DEFAULT 'PENDIENTE',
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cliente_ci" INTEGER NOT NULL,
    "diagnostico_id" BIGINT,

    CONSTRAINT "proforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proforma_repuesto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "proforma_id" BIGINT NOT NULL,

    CONSTRAINT "proforma_repuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."servicio" (
    "id" SERIAL NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "categoria_id" INTEGER NOT NULL,

    CONSTRAINT "servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuario" (
    "id" SERIAL NOT NULL,
    "empleado_ci" INTEGER NOT NULL,
    "usuario" VARCHAR(50) NOT NULL,
    "contrasena" VARCHAR(200) NOT NULL,
    "email" VARCHAR(150),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrador_usuario_id_key" ON "public"."administrador"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "comision_orden_id_key" ON "public"."comision"("orden_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_diag_moto_momento" ON "public"."diagnostico"("placa_moto", "fecha", "hora");

-- CreateIndex
CREATE UNIQUE INDEX "moto_chasis_key" ON "public"."moto"("chasis");

-- CreateIndex
CREATE UNIQUE INDEX "proforma_diagnostico_id_key" ON "public"."proforma"("diagnostico_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_empleado_ci_key" ON "public"."usuario"("empleado_ci");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_usuario_key" ON "public"."usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "public"."usuario"("email");

-- AddForeignKey
ALTER TABLE "public"."administrador" ADD CONSTRAINT "administrador_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comision" ADD CONSTRAINT "comision_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "public"."orden_trabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_diagnostico" ADD CONSTRAINT "detalle_diagnostico_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "public"."diagnostico"("nro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."detalle_proforma" ADD CONSTRAINT "detalle_proforma_proforma_id_fkey" FOREIGN KEY ("proforma_id") REFERENCES "public"."proforma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_proforma" ADD CONSTRAINT "detalle_proforma_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diagnostico" ADD CONSTRAINT "diagnostico_empleado_ci_fkey" FOREIGN KEY ("empleado_ci") REFERENCES "public"."empleado"("ci") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diagnostico" ADD CONSTRAINT "diagnostico_placa_moto_fkey" FOREIGN KEY ("placa_moto") REFERENCES "public"."moto"("placa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."factura" ADD CONSTRAINT "factura_cliente_ci_fkey" FOREIGN KEY ("cliente_ci") REFERENCES "public"."cliente"("ci") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."herramienta" ADD CONSTRAINT "herramienta_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "public"."marca_herramienta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario_empleado" ADD CONSTRAINT "horario_empleado_empleado_ci_fkey" FOREIGN KEY ("empleado_ci") REFERENCES "public"."empleado"("ci") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario_empleado" ADD CONSTRAINT "horario_empleado_horario_id_fkey" FOREIGN KEY ("horario_id") REFERENCES "public"."horario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moto" ADD CONSTRAINT "moto_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "public"."marca_moto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."movimiento_herramienta" ADD CONSTRAINT "movimiento_herramienta_herramienta_id_fkey" FOREIGN KEY ("herramienta_id") REFERENCES "public"."herramienta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento_herramienta" ADD CONSTRAINT "movimiento_herramienta_orden_trabajo_id_fkey" FOREIGN KEY ("orden_trabajo_id") REFERENCES "public"."orden_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orden_trabajo" ADD CONSTRAINT "orden_trabajo_administrador_id_fkey" FOREIGN KEY ("administrador_id") REFERENCES "public"."administrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orden_trabajo" ADD CONSTRAINT "orden_trabajo_empleado_ci_fkey" FOREIGN KEY ("empleado_ci") REFERENCES "public"."empleado"("ci") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orden_trabajo" ADD CONSTRAINT "orden_trabajo_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proforma" ADD CONSTRAINT "proforma_cliente_ci_fkey" FOREIGN KEY ("cliente_ci") REFERENCES "public"."cliente"("ci") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proforma" ADD CONSTRAINT "proforma_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "public"."diagnostico"("nro") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proforma_repuesto" ADD CONSTRAINT "proforma_repuesto_proforma_id_fkey" FOREIGN KEY ("proforma_id") REFERENCES "public"."proforma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."servicio" ADD CONSTRAINT "servicio_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_empleado_ci_fkey" FOREIGN KEY ("empleado_ci") REFERENCES "public"."empleado"("ci") ON DELETE CASCADE ON UPDATE CASCADE;
