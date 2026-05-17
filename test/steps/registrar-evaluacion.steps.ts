/// <reference types="jest" />

// test/bdd/steps/registrar-evaluacion-desempeno.steps.ts
import { Test, TestingModule } from '@nestjs/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';
import * as path from 'path';

import {
  mockPrismaService,
  mockNatsClient,
  mockEvaluation,
  resetMocks,
} from '../mock/prisma.mock';

// Mock de envs ANTES de importar servicios que dependen de ellas
// PrismaService las consume al instanciarse
jest.mock('../../src/config', () => ({
  envs: {
    databaseUrl: 'postgresql://mock:mock@localhost:5432/mock',
    natsServers: ['nats://localhost:4222'],
  },
  NATS_SERVICE: 'NATS_SERVICE',
}));

// Mock de PrismaService completo para evitar conexion real a BD
jest.mock('../../src/lib/prisma', () => ({
  PrismaService: jest.fn().mockImplementation(() => mockPrismaService),
}));

import { PerformanceEvaluationService } from '../../src/performance-evaluation/performance-evaluation.service';
import { PrismaService } from '../../src/lib/prisma';
import { NATS_SERVICE } from '../../src/config/services';
import { CreatePerformanceEvaluationDto } from '../../src/performance-evaluation/dto/create-performance-evaluation.dto';
import { RpcException } from '@nestjs/microservices';

const feature = loadFeature(
  path.join(__dirname, '../features/registrar-evaluacion-desempeno.feature'),
);

type EvaluationResult = {
  id_evaluation?: number;
  id_director?: number;
  observations?: string;
  evaluation_date?: Date;
  communication?: number;
  technical_proficiency?: number;
  leadership_influence?: number;
  innovation?: number;
  reliability?: number;
  [key: string]: unknown;
};

defineFeature(feature, (test) => {
  let service: PerformanceEvaluationService;
  let createDto: Partial<CreatePerformanceEvaluationDto>;
  let result: unknown;
  let thrownError: RpcException | Error | undefined;

  beforeEach(async () => {
    resetMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceEvaluationService,
        // PrismaService inyectado como clase — token ES la clase
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        // NATS_SERVICE es el string 'NATS_SERVICE' definido en config/services.ts
        {
          provide: NATS_SERVICE,
          useValue: mockNatsClient,
        },
      ],
    }).compile();

    service = module.get<PerformanceEvaluationService>(
      PerformanceEvaluationService,
    );
    result = undefined;
    thrownError = undefined;
  });

  // =========================================================================
  // CA2: Successful registration with all required fields
  // Real method: service.create(dto)
  // =========================================================================
  test('Successful registration of evaluation with complete fields', ({
    given,
    when,
    then,
    and,
  }) => {
    given('that the evaluator has complete evaluation data', () => {
      createDto = {
        id_director: 10,
        observations: 'Good overall performance',
        evaluation_date: new Date('2024-06-30'),
        communication: 4.5,
        technical_proficiency: 4.0,
        leadership_influence: 3.8,
        innovation: 4.2,
        reliability: 4.7,
      };

      // Prisma creates the evaluation and returns the complete record
      mockPrismaService.performance_evaluations.create.mockResolvedValue(
        mockEvaluation,
      );
    });

    when('he confirms the evaluation registration', async () => {
      result = await service.create(
        createDto as CreatePerformanceEvaluationDto,
      );
    });

    then('the system stores the evaluation in the database', () => {
      expect(
        mockPrismaService.performance_evaluations.create,
      ).toHaveBeenCalledTimes(1);

      // Verify that create was called with correct data
      expect(
        mockPrismaService.performance_evaluations.create,
      ).toHaveBeenCalledTimes(1);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const callArgs =
        mockPrismaService.performance_evaluations.create.mock.calls[0][0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(callArgs.data.id_director).toBe(10);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(callArgs.data.communication).toBe(4.5);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(callArgs.data.technical_proficiency).toBe(4.0);
      expect(result).toBeDefined();
    });

    and(
      'the evaluation is available in the history with a generated id',
      () => {
        // id_evaluation comes from Prisma (autoincrement in the DB)
        expect((result as EvaluationResult).id_evaluation).toBeDefined();
        expect((result as EvaluationResult).id_evaluation).toBe(
          mockEvaluation.id_evaluation,
        );
        // The creation DTO should NOT include id_evaluation (not editable)
        expect(createDto).not.toHaveProperty('id_evaluation');
      },
    );
  });

  // =========================================================================
  // CA2: Optional rating fields with default value 0 defined in schema
  // =========================================================================
  test('Successful registration with ratings at zero by default', ({
    given,
    when,
    then,
  }) => {
    given(
      'that the evaluator registers an evaluation without explicit ratings',
      () => {
        createDto = {
          id_director: 10,
          evaluation_date: new Date('2024-07-15'),
          // Sin communication, technical_proficiency, etc.
        };

        mockPrismaService.performance_evaluations.create.mockResolvedValue({
          ...mockEvaluation,
          evaluation_date: new Date('2024-07-15'),
          communication: 0,
          technical_proficiency: 0,
          leadership_influence: 0,
          innovation: 0,
          reliability: 0,
        });
      },
    );

    when('he confirms the evaluation registration', async () => {
      result = await service.create(
        createDto as CreatePerformanceEvaluationDto,
      );
    });

    then(
      'the system stores the evaluation with ratings at zero by default',
      () => {
        expect(result).toBeDefined();
        // Default values are applied by Prisma/PostgreSQL according to schema
        // (@default(0) in the performance_evaluations model)
        expect((result as EvaluationResult).communication).toBe(0);
        expect((result as EvaluationResult).technical_proficiency).toBe(0);
        expect(
          mockPrismaService.performance_evaluations.create,
        ).toHaveBeenCalledTimes(1);
      },
    );
  });

  // =========================================================================
  // CA3: Duplicate evaluation for the same period
  // Prisma throws constraint error -> the service throws RpcException
  // =========================================================================
  test('Warning for duplicate evaluation for the same period', ({
    given,
    and,
    when,
    then,
  }) => {
    given(
      /^that there is already a registered evaluation for the date "(.*)"$/,
      () => {
        // The DB already has a record for that date (simulated)
      },
    );

    and(
      /^the evaluator attempts to register another evaluation for the same date "(.*)"$/,
      (fecha: string) => {
        createDto = {
          id_director: 10,
          evaluation_date: new Date(fecha),
          observations: 'Second evaluation of the same period',
          communication: 3.0,
          technical_proficiency: 3.0,
          leadership_influence: 3.0,
          innovation: 3.0,
          reliability: 3.0,
        };

        // Prisma throws a constraint error when attempting to create the duplicate
        mockPrismaService.performance_evaluations.create.mockRejectedValue(
          new Error(
            'Unique constraint failed: there is already an evaluation for this period',
          ),
        );
      },
    );

    when('the system attempts to save the duplicate evaluation', async () => {
      try {
        result = await service.create(
          createDto as CreatePerformanceEvaluationDto,
        );
      } catch (error) {
        thrownError = error as RpcException;
      }
    });

    then(
      'the system rejects the operation with an incorrect request error',
      () => {
        expect(thrownError).toBeDefined();
        // The service converts the Prisma error to RpcException with BAD_REQUEST
        expect(thrownError).toBeInstanceOf(RpcException);
        const errorPayload = (thrownError as RpcException).getError() as {
          status: number;
          message: string;
        };
        expect(errorPayload.status).toBe(400); // HttpStatus.BAD_REQUEST
        expect(errorPayload.message).toMatch(/evaluacion|constraint|periodo/i);
        // Nunca debe completarse la creacion
        expect(
          mockPrismaService.performance_evaluations.create,
        ).toHaveBeenCalledTimes(1);
      },
    );
  });

  // =========================================================================
  // CA4: Evaluacion disponible en historial -> findOne(id)
  // Real method: service.findOne(id: number)
  // =========================================================================
  test('Query of successfully registered evaluation', ({
    given,
    when,
    then,
  }) => {
    given('that there is a registered evaluation with id 1', () => {
      mockPrismaService.performance_evaluations.findUnique.mockResolvedValue(
        mockEvaluation,
      );
    });

    when('the evaluator queries the evaluation with id 1', async () => {
      result = await service.findOne(1);
    });

    then('the system returns the complete evaluation data', () => {
      expect(result).toBeDefined();
      expect((result as EvaluationResult).id_evaluation).toBe(1);
      expect((result as EvaluationResult).id_director).toBeDefined();
      expect((result as EvaluationResult).evaluation_date).toBeDefined();
      expect((result as EvaluationResult).communication).toBeDefined();

      expect(
        mockPrismaService.performance_evaluations.findUnique,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_evaluation: 1 } }),
      );
    });
  });

  // =========================================================================
  // CA5: Database error during registration -> RpcException with clear message
  // =========================================================================
  test('Database error during registration', ({ given, when, then }) => {
    given('that a database error occurs when attempting to register', () => {
      createDto = {
        id_director: 10,
        evaluation_date: new Date('2024-08-01'),
      };

      // Simulates an unexpected database connection error
      mockPrismaService.performance_evaluations.create.mockRejectedValue(
        new Error('Connection timeout: could not connect to the database'),
      );
    });

    when(
      'the evaluator attempts to confirm the evaluation registration',
      async () => {
        try {
          result = await service.create(
            createDto as CreatePerformanceEvaluationDto,
          );
        } catch (error) {
          thrownError = error as RpcException;
        }
      },
    );

    then('the system throws an exception with a clear error message', () => {
      expect(thrownError).toBeDefined();
      // The service always converts errors to RpcException (never exposes raw errors)
      expect(thrownError).toBeInstanceOf(RpcException);
      const errorPayload = (thrownError as RpcException).getError() as {
        status: number;
        message: string;
      };
      // The message should be from the original error (not "Unknown error")
      expect(errorPayload.message).toMatch(/Connection timeout|database/i);
      expect(errorPayload.status).toBe(400);
    });
  });

  // =========================================================================
  // CA4: Non-existent evaluation -> RpcException with NOT_FOUND
  // Real method: service.findOne(id) with Prisma returning null
  // =========================================================================
  test('Query of evaluation that does not exist', ({ given, when, then }) => {
    given('that there is no evaluation with id 999', () => {
      // Prisma returns null when it doesn't find the record
      mockPrismaService.performance_evaluations.findUnique.mockResolvedValue(
        null,
      );
    });

    when('the evaluator queries the evaluation with id 999', async () => {
      try {
        result = await service.findOne(999);
      } catch (error) {
        thrownError = error as RpcException;
      }
    });

    then(
      'the system returns an error indicating that the evaluation was not found',
      () => {
        expect(thrownError).toBeDefined();
        expect(thrownError).toBeInstanceOf(RpcException);
        const errorPayload = (thrownError as RpcException).getError() as {
          status: number;
          message: string;
        };
        // El servicio lanza: 'Evaluación de desempeño con id 999 no encontrada'
        expect(errorPayload.message).toMatch(/999|no encontrada/i);
        expect(errorPayload.status).toBe(404); // HttpStatus.NOT_FOUND
      },
    );
  });
});
