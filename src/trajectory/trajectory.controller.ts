import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TrajectoryService } from './trajectory.service';
import { CreateTrajectoryDto } from './dto/create-trajectory.dto';
import { UpdateTrajectoryDto } from './dto/update-trajectory.dto';

@Controller()
export class TrajectoryController {
  constructor(private readonly trajectoryService: TrajectoryService) {}

  // @MessagePattern('createTrajectory')
  // create(@Payload() createTrajectoryDto: CreateTrajectoryDto) {
  //   return this.trajectoryService.create(createTrajectoryDto);
  // }

  @MessagePattern({cmd:'findAllTrajectory'})
  findAll() {
    return this.trajectoryService.findAll();
  }

  // @MessagePattern('findOneTrajectory')
  // findOne(@Payload() id: number) {
  //   return this.trajectoryService.findOne(id);
  // }

  // @MessagePattern('updateTrajectory')
  // update(@Payload() updateTrajectoryDto: UpdateTrajectoryDto) {
  //   return this.trajectoryService.update(updateTrajectoryDto.id, updateTrajectoryDto);
  // }

  // @MessagePattern('removeTrajectory')
  // remove(@Payload() id: number) {
  //   return this.trajectoryService.remove(id);
  // }
}
