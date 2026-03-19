jest.mock('../../config/env', () => ({
  env: { DATABASE_URL: 'postgresql://localhost/test' },
}));

const mockPrismaClient = jest.fn();
const mockPrismaPg = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: mockPrismaClient,
}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: mockPrismaPg,
}));

describe('getPrismaClient', () => {
  beforeEach(() => {
    jest.resetModules();
    mockPrismaClient.mockClear();
    mockPrismaPg.mockClear();
  });

  it('should create PrismaPg adapter with DATABASE_URL', () => {
    const { getPrismaClient } = require('../../config/prisma');
    getPrismaClient();

    expect(mockPrismaPg).toHaveBeenCalledWith({
      connectionString: 'postgresql://localhost/test',
    });
  });

  it('should create PrismaClient with the adapter', () => {
    const mockAdapter = {};
    mockPrismaPg.mockReturnValueOnce(mockAdapter);

    const { getPrismaClient } = require('../../config/prisma');
    getPrismaClient();

    expect(mockPrismaClient).toHaveBeenCalledWith({ adapter: mockAdapter });
  });

  it('should return the same instance on multiple calls (singleton)', () => {
    const { getPrismaClient } = require('../../config/prisma');

    const instance1 = getPrismaClient();
    const instance2 = getPrismaClient();

    expect(instance1).toBe(instance2);
    expect(mockPrismaClient).toHaveBeenCalledTimes(1);
  });
});
