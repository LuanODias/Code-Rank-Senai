const { faker } = require('@faker-js/faker');
const {
  ChallengeRepository,
} = require('../../repositories/challenge.repository');

describe('ChallengeRepository', () => {
  const makeChallengeRecord = () => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    difficulty: 'medium',
    teacherId: faker.string.uuid(),
    teacher: {
      id: faker.string.uuid(),
      user: { name: faker.person.fullName() },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const makeTeacherRecord = () => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
  });

  const makePrisma = () => ({
    challenge: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
    },
  });

  const makeSut = () => {
    const prisma = makePrisma();
    const sut = new ChallengeRepository(prisma);
    return { sut, prisma };
  };

  describe('findById', () => {
    it('should call prisma.challenge.findUnique with id and nested includes', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const challenge = makeChallengeRecord();
      prisma.challenge.findUnique.mockResolvedValueOnce(challenge);

      // act
      const result = await sut.findById(challenge.id);

      // assert
      expect(prisma.challenge.findUnique).toHaveBeenCalledWith({
        where: { id: challenge.id },
        include: { teacher: { include: { user: true } } },
      });
      expect(result).toEqual(challenge);
    });

    it('should return null when challenge is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.challenge.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findById(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should call prisma.challenge.findMany with nested includes ordered by createdAt desc', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const challenges = [makeChallengeRecord(), makeChallengeRecord()];
      prisma.challenge.findMany.mockResolvedValueOnce(challenges);

      // act
      const result = await sut.findAll();

      // assert
      expect(prisma.challenge.findMany).toHaveBeenCalledWith({
        include: { teacher: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(challenges);
    });

    it('should return empty array when there are no challenges', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.challenge.findMany.mockResolvedValueOnce([]);

      // act
      const result = await sut.findAll();

      // assert
      expect(result).toEqual([]);
    });
  });

  describe('findByTeacherId', () => {
    it('should call prisma.challenge.findMany filtered by teacherId', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const teacherId = faker.string.uuid();
      const challenges = [makeChallengeRecord()];
      prisma.challenge.findMany.mockResolvedValueOnce(challenges);

      // act
      const result = await sut.findByTeacherId(teacherId);

      // assert
      expect(prisma.challenge.findMany).toHaveBeenCalledWith({
        where: { teacherId },
        include: { teacher: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(challenges);
    });
  });

  describe('create', () => {
    it('should call prisma.challenge.create with data and nested includes', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        difficulty: 'easy',
        teacherId: faker.string.uuid(),
      };
      const challenge = makeChallengeRecord();
      prisma.challenge.create.mockResolvedValueOnce(challenge);

      // act
      const result = await sut.create(data);

      // assert
      expect(prisma.challenge.create).toHaveBeenCalledWith({
        data,
        include: { teacher: { include: { user: true } } },
      });
      expect(result).toEqual(challenge);
    });
  });

  describe('update', () => {
    it('should call prisma.challenge.update with id, data and nested includes', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const id = faker.string.uuid();
      const data = { title: faker.lorem.sentence() };
      const updated = makeChallengeRecord();
      prisma.challenge.update.mockResolvedValueOnce(updated);

      // act
      const result = await sut.update(id, data);

      // assert
      expect(prisma.challenge.update).toHaveBeenCalledWith({
        where: { id },
        data,
        include: { teacher: { include: { user: true } } },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call prisma.challenge.delete with correct where clause', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const id = faker.string.uuid();
      prisma.challenge.delete.mockResolvedValueOnce(undefined);

      // act
      await sut.remove(id);

      // assert
      expect(prisma.challenge.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('findTeacherByUserId', () => {
    it('should call prisma.teacher.findUnique with correct where clause', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const teacher = makeTeacherRecord();
      prisma.teacher.findUnique.mockResolvedValueOnce(teacher);

      // act
      const result = await sut.findTeacherByUserId(teacher.userId);

      // assert
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { userId: teacher.userId },
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
});
