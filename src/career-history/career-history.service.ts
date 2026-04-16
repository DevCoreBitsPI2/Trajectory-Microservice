import { Injectable, Logger, HttpStatus, Inject } from '@nestjs/common';
import { CreateCareerHistoryDto } from './dto/create-career-history.dto';
import { UpdateCareerHistoryDto } from './dto/update-career-history.dto';
import { NATS_SERVICE } from 'src/config';
import { PrismaService } from 'src/lib/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { create } from 'domain';

@Injectable()
export class CareerHistoryService {

  private readonly logger = new Logger('career history service')

  constructor(
    // @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly prisma: PrismaService
  ){}

  async create(createCareerHistoryDto: CreateCareerHistoryDto) {
    try{
      return await this.prisma.career_history.create({
        data:{
          description: createCareerHistoryDto.description,
          event_date: createCareerHistoryDto.event_date,
          type: createCareerHistoryDto.type,
          id_employee: createCareerHistoryDto.id_employee,
          created_at: new Date()
        }
      })
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try{
      const total = await this.prisma.career_history.count();
      const currentPage = paginationDto.page;
      const perPage = paginationDto.limit;

      return {
        data: await this.prisma.career_history.findMany({
          skip: (currentPage - 1) * perPage,
          take: perPage,
      }),
      meta: {
        total,
        page: currentPage,
        lastPage: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async findOne(id: number) {
    try {
      const career_history = await this.prisma.career_history.findUnique({
        where: {id_record: id},
      });

      if (!career_history) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Historio de carrera con id ${id} no encontrada`,
        });
      }

      return career_history;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  async update(id: number, updateCareerHistoryDto: UpdateCareerHistoryDto) {
    try {
      await this.findOne(id); 

      const { id: _, ...data } = updateCareerHistoryDto;

      return await this.prisma.career_history.update({
        where: { id_record: id },
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

      return await this.prisma.career_history.delete({
        where: { id_record: id },
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
