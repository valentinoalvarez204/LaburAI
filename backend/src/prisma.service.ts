import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    console.log(`🔌 Conectando a la base de datos: ${dbUrl}`);
    const adapter = new PrismaPg({
      connectionString: dbUrl,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}