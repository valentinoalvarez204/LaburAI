import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [AuthModule, AiModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}