const { faker } = require('@faker-js/faker');
const { StudentRepository } = require('../../repositories/student.repository');

describe('StudentRepository', () => {
  const makeUserRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'student',
    ...overrides,
  });

  const makeStudentRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    user: makeUserRecord(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const makePrisma = () => ({
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  });

  const makeSut = () => {
    const prisma = makePrisma();
    const sut = new StudentRepository(prisma);
    return { sut, prisma };
  };

  describe('findByEmail', () => {
    it('should call prisma.user.findUnique with email', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const email = faker.internet.email();
      const user = makeUserRecord({ email });
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
      const result = await sut.findByEmail(faker.internet.email());

      // assert
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should call prisma.student.findUnique with id and user include', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const student = makeStudentRecord();
      prisma.student.findUnique.mockResolvedValueOnce(student);

      // act
      const result = await sut.findById(student.id);

      // assert
      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: student.id },
        include: { user: true },
      });
      expect(result).toEqual(student);
    });

    it('should return null when student is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.student.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findById(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should call prisma.student.findMany with user include', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const students = [makeStudentRecord(), makeStudentRecord()];
      prisma.student.findMany.mockResolvedValueOnce(students);

      // act
      const result = await sut.findAll();

      // assert
      expect(prisma.student.findMany).toHaveBeenCalledWith({
        include: { user: true },
      });
      expect(result).toEqual(students);
    });
  });

  describe('create', () => {
    it('should call prisma.student.create with userId and user include', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      const student = makeStudentRecord({ userId });
      prisma.student.create.mockResolvedValueOnce(student);

      // act
      const result = await sut.create(userId);

      // assert
      expect(prisma.student.create).toHaveBeenCalledWith({
        data: { userId },
        include: { user: true },
      });
      expect(result).toEqual(student);
    });
  });

  describe('update', () => {
    it('should call prisma.student.update with id, nested user data, and include', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const student = makeStudentRecord();
      const data = { name: 'New Name' };
      const updated = {
        ...student,
        user: { ...student.user, name: data.name },
      };
      prisma.student.update.mockResolvedValueOnce(updated);

      // act
      const result = await sut.update(student.id, data);

      // assert
      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: student.id },
        data: { user: { update: data } },
        include: { user: true },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call prisma.student.delete with id', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const id = faker.string.uuid();
      prisma.student.delete.mockResolvedValueOnce({});

      // act
      await sut.remove(id);

      // assert
      expect(prisma.student.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('updateUserRole', () => {
    it('should call prisma.user.update with userId and role', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      prisma.user.update.mockResolvedValueOnce({});

      // act
      await sut.updateUserRole(userId, 'student');

      // assert
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { role: 'student' },
      });
    });
  });
});
