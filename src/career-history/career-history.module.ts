import { Module } from '@nestjs/common';
import { CareerHistoryService } from './career-history.service';
import { CareerHistoryController } from './career-history.controller';
import { NatsModule } from 'src/transports/nats.module';
import { PrismaService } from 'src/lib/prisma';

@Module({
  controllers: [CareerHistoryController],
  providers: [CareerHistoryService, PrismaService],
  imports: [
    NatsModule
  ]
})
export class CareerHistoryModule {}
