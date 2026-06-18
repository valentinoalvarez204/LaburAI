import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [AuthModule, AiModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}