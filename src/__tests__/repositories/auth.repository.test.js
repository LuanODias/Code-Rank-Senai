const { faker } = require('@faker-js/faker');
const { AuthRepository } = require('../../repositories/auth.repository');

describe('AuthRepository', () => {
  const makePrisma = () => ({
    user: {
      findUnique: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  });

  const makeSut = () => {
    const prisma = makePrisma();
    const sut = new AuthRepository(prisma);
    return { sut, prisma };
  };

  describe('findUserByEmail', () => {
    it('should call prisma.user.findUnique with correct where clause', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const email = faker.internet.email();
      const user = { id: faker.string.uuid(), email };
      prisma.user.findUnique.mockResolvedValueOnce(user);

      // act
      const result = await sut.findUserByEmail(email);

      // assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.user.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findUserByEmail('notfound@test.com');

      // assert
      expect(result).toBeNull();
    });
  });

  describe('findTeacherByUserId', () => {
    it('should call prisma.teacher.findUnique with correct where clause', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      const teacher = {
        id: faker.string.uuid(),
        userId,
        mustChangePassword: false,
      };
      prisma.teacher.findUnique.mockResolvedValueOnce(teacher);

      // act
      const result = await sut.findTeacherByUserId(userId);

      // assert
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(teacher);
    });

    it('should return null when teacher is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.teacher.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findTeacherByUserId(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });

  describe('clearMustChangePassword', () => {
    it('should call prisma.teacher.update with correct params', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      prisma.teacher.update.mockResolvedValueOnce(undefined);

      // act
      await sut.clearMustChangePassword(userId);

      // assert
      expect(prisma.teacher.update).toHaveBeenCalledWith({
        where: { userId },
        data: { mustChangePassword: false },
      });
    });
  });
});
