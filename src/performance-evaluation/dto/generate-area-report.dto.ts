import { IsEnum, IsISO8601, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportExportFormat } from './report-filter.dto';

export class GenerateAreaReportDto {
  @IsInt()
  @Type(() => Number)
  areaId: number;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsEnum(ReportExportFormat)
  export?: ReportExportFormat;
}
