import { PartialType } from '@nestjs/mapped-types';
import { CreateCareerHistoryDto } from './create-career-history.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateCareerHistoryDto extends PartialType(CreateCareerHistoryDto) {
  @IsNumber()
  @IsPositive()
  id: number;
}
