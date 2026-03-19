const { faker } = require('@faker-js/faker');
const { TeacherRepository } = require('../../repositories/teacher.repository');

describe('TeacherRepository', () => {
  const makeTeacherRecord = () => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    mustChangePassword: true,
    user: { name: faker.person.fullName(), email: faker.internet.email() },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const makePrisma = () => ({
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  });

  const makeSut = () => {
    const prisma = makePrisma();
    const sut = new TeacherRepository(prisma);
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
    it('should call prisma.teacher.findUnique with id and include user', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const teacher = makeTeacherRecord();
      prisma.teacher.findUnique.mockResolvedValueOnce(teacher);

      // act
      const result = await sut.findById(teacher.id);

      // assert
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: teacher.id },
        include: { user: true },
      });
      expect(result).toEqual(teacher);
    });

    it('should return null when teacher is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.teacher.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findById(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should call prisma.teacher.findMany with include user', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const teachers = [makeTeacherRecord(), makeTeacherRecord()];
      prisma.teacher.findMany.mockResolvedValueOnce(teachers);

      // act
      const result = await sut.findAll();

      // assert
      expect(prisma.teacher.findMany).toHaveBeenCalledWith({
        include: { user: true },
      });
      expect(result).toEqual(teachers);
    });

    it('should return empty array when there are no teachers', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.teacher.findMany.mockResolvedValueOnce([]);

      // act
      const result = await sut.findAll();

      // assert
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should call prisma.teacher.create with userId and mustChangePassword true', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      const teacher = makeTeacherRecord();
      prisma.teacher.create.mockResolvedValueOnce(teacher);

      // act
      const result = await sut.create(userId);

      // assert
      expect(prisma.teacher.create).toHaveBeenCalledWith({
        data: { userId, mustChangePassword: true },
        include: { user: true },
      });
      expect(result).toEqual(teacher);
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

  describe('updateUserRole', () => {
    it('should call prisma.user.update with correct params', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      const role = 'teacher';
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

  describe('update', () => {
    it('should call prisma.teacher.update with nested user data', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const id = faker.string.uuid();
      const data = { name: faker.person.fullName() };
      const updated = makeTeacherRecord();
      prisma.teacher.update.mockResolvedValueOnce(updated);

      // act
      const result = await sut.update(id, data);

      // assert
      expect(prisma.teacher.update).toHaveBeenCalledWith({
        where: { id },
        data: { user: { update: data } },
        include: { user: true },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call prisma.teacher.delete with correct where clause', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const id = faker.string.uuid();
      prisma.teacher.delete.mockResolvedValueOnce(undefined);

      // act
      await sut.remove(id);

      // assert
      expect(prisma.teacher.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
