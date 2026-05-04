import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreatePerformanceEvaluationDto {
  @IsNumber()
  @IsPositive()
  id_director: number;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsDate()
  @Type(() => Date)
  evaluation_date: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  communication: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  technical_proficiency: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leadership_influence: number;

  @IsOptional()
  @IsNumber() 
  @Min(0)
  innovation: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reliability: number;

  career_history?: any[];
}
