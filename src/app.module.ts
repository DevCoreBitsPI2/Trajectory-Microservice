import { Module } from '@nestjs/common';
import { TrajectoryModule } from './trajectory/trajectory.module';
import { CareerHistoryModule } from './career-history/career-history.module';
import { PerformanceEvaluationsModule } from './performance-evaluations/performance-evaluations.module';

@Module({
  imports: [TrajectoryModule, CareerHistoryModule, PerformanceEvaluationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
