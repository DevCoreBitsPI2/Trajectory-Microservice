import { Module } from '@nestjs/common';
import { TrajectoryModule } from './trajectory/trajectory.module';

@Module({
  imports: [TrajectoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
