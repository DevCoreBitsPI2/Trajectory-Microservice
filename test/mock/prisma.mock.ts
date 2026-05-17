/// <reference types="jest" />

type MockedMethods<T extends string> = Record<T, jest.Mock>;

type PerformanceEvaluationMock = MockedMethods<
  'create' | 'findUnique' | 'findMany' | 'update' | 'delete' | 'count'
>;

type CareerHistoryMock = MockedMethods<
  'create' | 'findUnique' | 'findMany' | 'update' | 'delete' | 'count'
>;

// ─── Mock de PrismaService ────────────────────────────────────────────────────
// El servicio usa: this.prisma.performance_evaluations.* y this.prisma.career_history.*
export const mockPrismaService: {
  performance_evaluations: PerformanceEvaluationMock;
  career_history: CareerHistoryMock;
} = {
  performance_evaluations: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  career_history: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

// ─── Mock del ClientProxy de NATS ────────────────────────────────────────────
// El servicio usa: firstValueFrom(this.natsClient.send({ cmd: '...' }, payload))
export const mockNatsClient: { send: jest.Mock } = {
  send: jest.fn(),
};

// ─── Evaluación de ejemplo reutilizable ───────────────────────────────────────
export const mockEvaluation = {
  id_evaluation: 1,
  id_director: 10,
  observations: 'Buen desempeño general',
  evaluation_date: new Date('2024-06-30'),
  created_at: new Date('2024-06-30'),
  communication: 4.5,
  technical_proficiency: 4.0,
  leadership_influence: 3.8,
  innovation: 4.2,
  reliability: 4.7,
};

// ─── Resetea todos los mocks entre escenarios ─────────────────────────────────
export function resetMocks(): void {
  Object.values(mockPrismaService.performance_evaluations).forEach(
    (fn: jest.Mock) => fn.mockReset(),
  );
  Object.values(mockPrismaService.career_history).forEach((fn: jest.Mock) =>
    fn.mockReset(),
  );
  mockNatsClient.send.mockReset();
}
