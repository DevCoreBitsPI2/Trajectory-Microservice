import { Module } from '@nestjs/common';
import { CareerHistoryModule } from './career-history/career-history.module';
import { PerformanceEvaluationModule } from './performance-evaluation/performance-evaluation.module';

@Module({
  imports: [CareerHistoryModule, PerformanceEvaluationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
