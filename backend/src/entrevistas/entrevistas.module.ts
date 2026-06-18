import { Module } from '@nestjs/common';
import { EntrevistasService } from './entrevistas.service';
import { EntrevistasController } from './entrevistas.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EntrevistasController],
  providers: [EntrevistasService],
})
export class EntrevistasModule {}
