import { PartialType } from '@nestjs/mapped-types';
import { CreateCareerHistoryDto } from './create-career-history.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateCareerHistoryDto extends PartialType(CreateCareerHistoryDto) {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id: number;
}
