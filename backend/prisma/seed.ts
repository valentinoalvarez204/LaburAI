import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// Configuración de la conexión a la base de datos usando el Driver Adapter para Prisma 7.x
const connectionString = `${process.env.DIRECT_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando script de seed (plantilla limpia)...');
  
  // =========================================================
  // EJEMPLO: Limpieza de tablas (Descomentar y ajustar según necesidad)
  // =========================================================
  // console.log('🧹 Limpiando la base de datos...');
  // await prisma.entrevista.deleteMany();
  // await prisma.postulacion.deleteMany();
  // await prisma.ofertaLaboral.deleteMany();
  // await prisma.candidato.deleteMany();
  // await prisma.empresa.deleteMany();
  // await prisma.usuario.deleteMany();

  // =========================================================
  // LOGIC DE INSERCIÓN ACA ABAJO
  // =========================================================
  
  // const passwordClara = '12345678';
  // const hashedPassword = await bcrypt.hash(passwordClara, 10);

  // Ejemplo: Lógica para insertar nuevos Candidatos o Empresas
  
  
  console.log('✅ Seeding finalizado con éxito.');
}

main()
  .catch(e => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Cerrar el pool de pg para que la terminal se libere correctamente
    await pool.end();
  });
