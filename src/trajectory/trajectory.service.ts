import { Inject, Injectable } from '@nestjs/common';
import { CreateTrajectoryDto } from './dto/create-trajectory.dto';
import { UpdateTrajectoryDto } from './dto/update-trajectory.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from 'src/lib/prisma';

@Injectable()
export class TrajectoryService {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly prisma: PrismaService
  ){}

  create(createTrajectoryDto: CreateTrajectoryDto) {
    return 'This action adds a new trajectory';
  }

  findAll() {
    return `This action returns all trajectory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trajectory`;
  }

  update(id: number, updateTrajectoryDto: UpdateTrajectoryDto) {
    return `This action updates a #${id} trajectory`;
  }

  remove(id: number) {
    return `This action removes a #${id} trajectory`;
  }
}
