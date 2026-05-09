import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { ProfileModule } from './profile/profile.module';
import { StatsModule } from './stats/stats.module';
import { EntrevistasModule } from './entrevistas/entrevistas.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    JobsModule,
    ApplicationsModule,
    ProfileModule,
    StatsModule,
    EntrevistasModule,
    DashboardModule,
    AiModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}