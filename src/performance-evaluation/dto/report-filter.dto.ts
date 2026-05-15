import { IsArray, IsEnum, IsISO8601, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportExportFormat {
  json = 'json',
  csv = 'csv',
}

export class ReportFilterDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  employeeIds?: number[];

  @IsOptional()
  @IsISO8601()
  startDate?: string; // ISO date string (inclusive)

  @IsOptional()
  @IsISO8601()
  endDate?: string; // ISO date string (inclusive)

  @IsOptional()
  @IsEnum(ReportExportFormat)
  export?: ReportExportFormat;
}
