const { faker } = require('@faker-js/faker');
const { AdminRepository } = require('../../repositories/admin.repository');

describe('AdminRepository', () => {
  const makePrisma = () => ({
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  });

  const makeSut = () => {
    const prisma = makePrisma();
    const sut = new AdminRepository(prisma);
    return { sut, prisma };
  };

  describe('findByEmail', () => {
    it('should call prisma.user.findUnique with correct where clause', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const email = faker.internet.email();
      const user = { id: faker.string.uuid(), email };
      prisma.user.findUnique.mockResolvedValueOnce(user);

      // act
      const result = await sut.findByEmail(email);

      // assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.user.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findByEmail('notfound@test.com');

      // assert
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should call prisma.user.findUnique with correct where clause', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const id = faker.string.uuid();
      const user = { id, name: faker.person.fullName() };
      prisma.user.findUnique.mockResolvedValueOnce(user);

      // act
      const result = await sut.findById(id);

      // assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.user.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findById(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });

  describe('updateUserRole', () => {
    it('should call prisma.user.update with correct params', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      const role = 'admin';
      prisma.user.update.mockResolvedValueOnce(undefined);

      // act
      await sut.updateUserRole(userId, role);

      // assert
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { role },
      });
    });
  });

  describe('deleteUser', () => {
    it('should call prisma.user.delete with correct where clause', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      prisma.user.delete.mockResolvedValueOnce(undefined);

      // act
      await sut.deleteUser(userId);

      // assert
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
