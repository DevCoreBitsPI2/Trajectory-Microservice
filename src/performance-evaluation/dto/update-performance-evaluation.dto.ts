import { PartialType } from '@nestjs/mapped-types';
import { CreatePerformanceEvaluationDto } from './create-performance-evaluation.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdatePerformanceEvaluationDto extends PartialType(CreatePerformanceEvaluationDto) {
  @IsNumber()
  @IsPositive()
  id: number;
}
