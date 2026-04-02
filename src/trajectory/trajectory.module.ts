import { Module } from '@nestjs/common';
import { TrajectoryService } from './trajectory.service';
import { TrajectoryController } from './trajectory.controller';
import { PrismaService } from 'src/lib/prisma';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [TrajectoryController],
  providers: [TrajectoryService, PrismaService],
  imports: [
    NatsModule
  ]
})
export class TrajectoryModule {}
