import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [JobsController],
  providers: [JobsService, PrismaService],
})
export class JobsModule {}