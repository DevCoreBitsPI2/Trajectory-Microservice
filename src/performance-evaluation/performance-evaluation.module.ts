import { Module } from '@nestjs/common';
import { PerformanceEvaluationService } from './performance-evaluation.service';
import { PerformanceEvaluationController } from './performance-evaluation.controller';
import { NatsModule } from 'src/transports/nats.module';
import { PrismaService } from 'src/lib/prisma';

@Module({
  controllers: [PerformanceEvaluationController],
  providers: [PerformanceEvaluationService, PrismaService],
  imports: [
    NatsModule
  ]
})
export class PerformanceEvaluationModule {}
