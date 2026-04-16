import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreatePerformanceEvaluationDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  id_record?: number;

  @IsNumber()
  @IsPositive()
  id_employee: number;

  @IsNumber()
  @IsPositive()
  id_director: number;

  @IsNumber()
  @IsPositive()
  score: number;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsDate()
  @Type(() => Date)
  evaluation_date: Date;
}
