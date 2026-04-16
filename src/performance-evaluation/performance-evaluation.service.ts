import { Injectable, Logger, HttpStatus, Inject } from '@nestjs/common';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';
import { NATS_SERVICE } from 'src/config';
import { PrismaService } from 'src/lib/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { stat } from 'fs';

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
          id_record: createPerformanceEvaluationDto.id_record,
          id_employee: createPerformanceEvaluationDto.id_employee,
          id_director: createPerformanceEvaluationDto.id_director,
          score: createPerformanceEvaluationDto.score,
          observations: createPerformanceEvaluationDto.observations,
          evaluation_date: createPerformanceEvaluationDto.evaluation_date,
          created_at: new Date(),
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

      const { id: _, ...data } = updatePerformanceEvaluationDto;

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
