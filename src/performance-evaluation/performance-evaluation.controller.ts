import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PerformanceEvaluationService } from './performance-evaluation.service';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { GenerateAreaReportDto } from './dto/generate-area-report.dto';
import { PaginationDto } from '@/src/common';

@Controller()
export class PerformanceEvaluationController {
  constructor(private readonly performanceEvaluationService: PerformanceEvaluationService) {}

  @MessagePattern({cmd: 'createPerformanceEvaluation'})
  create(@Payload() createPerformanceEvaluationDto: CreatePerformanceEvaluationDto) {
    return this.performanceEvaluationService.create(createPerformanceEvaluationDto);
  }

  @MessagePattern({cmd: 'findAllPerformanceEvaluation'})
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.performanceEvaluationService.findAll(paginationDto);
  }

  @MessagePattern({cmd: 'findOnePerformanceEvaluation'})
  findOne(@Payload() id: number) {
    return this.performanceEvaluationService.findOne(id);
  }

  @MessagePattern({cmd: 'findPerformanceEvaluationsByEmployee'})
  findByEmployee(@Payload() payload: { id_employee: number; paginationDto: PaginationDto }) {
    return this.performanceEvaluationService.findByEmployee(payload.id_employee, payload.paginationDto);
  }

  @MessagePattern({cmd: 'generateConsolidatedReport'})
  generateConsolidatedReport(@Payload() filter: ReportFilterDto) {
    return this.performanceEvaluationService.generateConsolidatedReport(filter);
  }

  @MessagePattern({cmd: 'generateAreaConsolidatedReport'})
  generateAreaReport(@Payload() dto: GenerateAreaReportDto) {
    return this.performanceEvaluationService.generateAreaReport(dto);
  }

  @MessagePattern({cmd: 'updatePerformanceEvaluation'})
  update(@Payload() updatePerformanceEvaluationDto: UpdatePerformanceEvaluationDto) {
    return this.performanceEvaluationService.update(updatePerformanceEvaluationDto.id, updatePerformanceEvaluationDto);
  }

  @MessagePattern({cmd: 'removePerformanceEvaluation'})
  remove(@Payload() id: number) {
    return this.performanceEvaluationService.remove(id);
  }
}
