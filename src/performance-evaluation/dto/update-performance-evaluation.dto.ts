import { PartialType } from '@nestjs/mapped-types';
import { CreatePerformanceEvaluationDto } from './create-performance-evaluation.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdatePerformanceEvaluationDto extends PartialType(CreatePerformanceEvaluationDto) {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id: number;
}
