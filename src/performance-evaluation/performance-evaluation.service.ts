import { Injectable, HttpStatus } from '@nestjs/common';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { PrismaService } from '@/src/lib/prisma';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from '@/src/common';

@Injectable()
export class PerformanceEvaluationService {
  constructor(
    // @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
    private readonly prisma: PrismaService
  ) {}

  async create(createPerformanceEvaluationDto: CreatePerformanceEvaluationDto) {
    try {
      return await this.prisma.performance_evaluations.create({
        data: {
          id_director: createPerformanceEvaluationDto.id_director,
          observations: createPerformanceEvaluationDto.observations,
          evaluation_date: createPerformanceEvaluationDto.evaluation_date,
          created_at: new Date(),
          communication: createPerformanceEvaluationDto.communication,
          technical_proficiency: createPerformanceEvaluationDto.technical_proficiency,
          leadership_influence: createPerformanceEvaluationDto.leadership_influence,
          innovation: createPerformanceEvaluationDto.innovation,
          reliability: createPerformanceEvaluationDto.reliability,
        }
      });
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try{
      const total = await this.prisma.performance_evaluations.count();
      const currentPage = paginationDto.page;
      const perPage = paginationDto.limit;
      
      return {
        data: await this.prisma.performance_evaluations.findMany({
          skip: (currentPage - 1) * perPage,
          take: perPage,
        }),
        meta: {
          total,
          page: currentPage,
          lastPage: Math.ceil(total / perPage),
        },
      };
    } catch (error){
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async generateConsolidatedReport(filter: ReportFilterDto) {
    try {
      const { employeeIds, startDate, endDate, export: exportFormat } = filter as any;

      // Obtener todas las evaluaciones de desempeño registradas
      const evaluations = await this.prisma.performance_evaluations.findMany({
        include: {
          career_history: {
            orderBy: [
              { event_date: 'desc' },
              { created_at: 'desc' },
            ],
            take: 1,
          },
        },
      });

      // Filtrar evaluaciones por rango de fecha y empleados, y agrupar por empleado
      const byEmployee = new Map<number, { count: number; sums: any }>();
      let totalEvaluations = 0;

      for (const evaluation of evaluations) {
        const evalDate = new Date(evaluation.evaluation_date);
        if (startDate && evalDate < new Date(startDate)) continue;
        if (endDate && evalDate > new Date(endDate)) continue;

        // Obtener el id_employee desde el career_history asociado
        const careerEntry = evaluation.career_history && evaluation.career_history.length > 0 ? evaluation.career_history[0] : null;
        if (!careerEntry) continue;

        const empId = careerEntry.id_employee;

        // Filtrar por employeeIds si se proporcionan
        if (employeeIds && employeeIds.length && !employeeIds.includes(empId)) continue;

        if (!byEmployee.has(empId)) {
          byEmployee.set(empId, {
            count: 0,
            sums: {
              communication: 0,
              technical_proficiency: 0,
              leadership_influence: 0,
              innovation: 0,
              reliability: 0,
            },
          });
        }

        const rec = byEmployee.get(empId) as any;
        rec.count += 1;
        rec.sums.communication += evaluation.communication ?? 0;
        rec.sums.technical_proficiency += evaluation.technical_proficiency ?? 0;
        rec.sums.leadership_influence += evaluation.leadership_influence ?? 0;
        rec.sums.innovation += evaluation.innovation ?? 0;
        rec.sums.reliability += evaluation.reliability ?? 0;
        totalEvaluations += 1;
      }

      const data: any[] = [];
      let overallSum = 0;
      let overallCount = 0;

      for (const [empId, rec] of byEmployee) {
        const avgComm = rec.sums.communication / rec.count;
        const avgTech = rec.sums.technical_proficiency / rec.count;
        const avgLead = rec.sums.leadership_influence / rec.count;
        const avgInno = rec.sums.innovation / rec.count;
        const avgRel = rec.sums.reliability / rec.count;

        const overall = (avgComm + avgTech + avgLead + avgInno + avgRel) / 5;

        data.push({
          id_employee: empId,
          averages: {
            communication: Number(avgComm.toFixed(2)),
            technical_proficiency: Number(avgTech.toFixed(2)),
            leadership_influence: Number(avgLead.toFixed(2)),
            innovation: Number(avgInno.toFixed(2)),
            reliability: Number(avgRel.toFixed(2)),
          },
          overall_score: Number(overall.toFixed(2)),
          evaluations: rec.count,
        });

        overallSum += overall;
        overallCount += 1;
      }

      const overallScore = overallCount ? Number((overallSum / overallCount).toFixed(2)) : null;

      const meta = {
        totalEmployees: data.length,
        totalEvaluations,
        overallScore,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
      };

      if (exportFormat === 'csv') {
        const headers = [
          'id_employee',
          'communication',
          'technical_proficiency',
          'leadership_influence',
          'innovation',
          'reliability',
          'overall_score',
          'evaluations',
        ];
        const rows = data.map((r) =>
          [
            r.id_employee,
            r.averages.communication,
            r.averages.technical_proficiency,
            r.averages.leadership_influence,
            r.averages.innovation,
            r.averages.reliability,
            r.overall_score,
            r.evaluations,
          ].join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        return { csv, meta };
      }

      if (data.length === 0) {
        return { data: [], meta, message: 'No hay información disponible para el rango seleccionado' };
      }

      return { data, meta };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Error desconocido al generar reporte',
      });
    }
  }

  async findOne(id: number) {
    try {
      const performance_evaluation = await this.prisma.performance_evaluations.findUnique({
        where: {id_evaluation: id}
      });

      if (!performance_evaluation) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Evaluación de desempeño con id ${id} no encontrada`,
        });
      }
      return performance_evaluation
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async update(id: number, updatePerformanceEvaluationDto: UpdatePerformanceEvaluationDto) {
    try {
      await this.findOne(id);

      const { id: __, ...data } = updatePerformanceEvaluationDto as any;

      return await this.prisma.performance_evaluations.update({
        where: {id_evaluation: id},
        data,     
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      return await this.prisma.performance_evaluations.delete({
        where: {id_evaluation: id},
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
}
