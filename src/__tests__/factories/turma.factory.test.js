const mockPrisma = {};

jest.mock('../../config/prisma', () => ({
  getPrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../repositories/turma.repository');
jest.mock('../../services/turma.service');
jest.mock('../../controllers/turma.controller');

const { getPrismaClient } = require('../../config/prisma');
const { TurmaRepository } = require('../../repositories/turma.repository');
const { TurmaService } = require('../../services/turma.service');
const { TurmaController } = require('../../controllers/turma.controller');
const { makeTurmaController } = require('../../factories/turma.factory');

describe('makeTurmaController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getPrismaClient', () => {
    makeTurmaController();
    expect(getPrismaClient).toHaveBeenCalledTimes(1);
  });

  it('should instantiate TurmaRepository with prisma client', () => {
    makeTurmaController();
    expect(TurmaRepository).toHaveBeenCalledWith(mockPrisma);
  });

  it('should instantiate TurmaService with repository', () => {
    makeTurmaController();
    const repositoryInstance = TurmaRepository.mock.instances[0];
    expect(TurmaService).toHaveBeenCalledWith(repositoryInstance);
  });

  it('should instantiate TurmaController with service', () => {
    makeTurmaController();
    const serviceInstance = TurmaService.mock.instances[0];
    expect(TurmaController).toHaveBeenCalledWith(serviceInstance);
  });

  it('should return a TurmaController instance', () => {
    const result = makeTurmaController();
    expect(result).toBeInstanceOf(TurmaController);
  });
});
