import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CareerHistoryService } from './career-history.service';
import { CreateCareerHistoryDto } from './dto/create-career-history.dto';
import { UpdateCareerHistoryDto } from './dto/update-career-history.dto';
import { PaginationDto } from 'src/common';

@Controller()
export class CareerHistoryController {
  constructor(private readonly careerHistoryService: CareerHistoryService) {}

  @MessagePattern({cmd: 'createCareerHistory'})
  create(@Payload() createCareerHistoryDto: CreateCareerHistoryDto) {
    return this.careerHistoryService.create(createCareerHistoryDto);
  }

  @MessagePattern({cmd: 'findAllCareerHistory'})
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.careerHistoryService.findAll(paginationDto);
  }

  @MessagePattern({cmd: 'findOneCareerHistory'})
  findOne(@Payload() id: number) {
    return this.careerHistoryService.findOne(id);
  }

  @MessagePattern({cmd: 'updateCareerHistory'})
  update(@Payload() updateCareerHistoryDto: UpdateCareerHistoryDto) {
    return this.careerHistoryService.update(updateCareerHistoryDto.id, updateCareerHistoryDto);
  }

  @MessagePattern({cmd: 'removeCareerHistory'} )
  remove(@Payload() id: number) {
    return this.careerHistoryService.remove(id);
  }
}
