-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('CANDIDATO', 'EMPRESA');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('PENDIENTE', 'REVISADA', 'ENTREVISTA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'CANDIDATO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidato" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "ubicacion" TEXT,
    "telefono" TEXT,
    "linkedin" TEXT,
    "cvUrl" TEXT,
    "scoreCV" INTEGER,
    "resumenIA" TEXT,
    "habilidades" TEXT[],
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Candidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "industria" TEXT,
    "descripcion" TEXT,
    "ubicacion" TEXT,
    "sitioWeb" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfertaLaboral" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "rubro" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "jornada" TEXT NOT NULL,
    "experiencia" TEXT,
    "estudios" TEXT,
    "salarioMin" INTEGER,
    "salarioMax" INTEGER,
    "habilidades" TEXT[],
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "OfertaLaboral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postulacion" (
    "id" TEXT NOT NULL,
    "estado" "Estado" NOT NULL DEFAULT 'PENDIENTE',
    "cartaMotivacion" TEXT,
    "matchIA" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidatoId" TEXT NOT NULL,
    "ofertaId" TEXT NOT NULL,

    CONSTRAINT "Postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidato_usuarioId_key" ON "Candidato"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_usuarioId_key" ON "Empresa"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Postulacion_candidatoId_ofertaId_key" ON "Postulacion"("candidatoId", "ofertaId");

-- AddForeignKey
ALTER TABLE "Candidato" ADD CONSTRAINT "Candidato_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "OfertaLaboral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
