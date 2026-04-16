import { Module } from '@nestjs/common';
import { TrajectoryModule } from './trajectory/trajectory.module';
import { CareerHistoryModule } from './career-history/career-history.module';
import { PerformanceEvaluationModule } from './performance-evaluation/performance-evaluation.module';

@Module({
  imports: [TrajectoryModule, CareerHistoryModule, PerformanceEvaluationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
