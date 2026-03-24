const { faker } = require('@faker-js/faker');
const {
  SubmissionRepository,
} = require('../../repositories/submission.repository');

describe('SubmissionRepository', () => {
  const INCLUDE = {
    student: { include: { user: true } },
    challenge: true,
  };

  const makeSubmissionRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    studentId: faker.string.uuid(),
    challengeId: faker.string.uuid(),
    code: 'console.log("hello")',
    language: 'javascript',
    status: 'pending',
    points: 0,
    feedback: null,
    student: {
      id: faker.string.uuid(),
      user: { name: faker.person.fullName() },
    },
    challenge: {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      difficulty: 'easy',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const makePrisma = () => ({
    submission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
    challenge: {
      findUnique: jest.fn(),
    },
  });

  const makeSut = () => {
    const prisma = makePrisma();
    const sut = new SubmissionRepository(prisma);
    return { sut, prisma };
  };

  describe('findById', () => {
    it('should call prisma.submission.findUnique with id and includes', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const submission = makeSubmissionRecord();
      prisma.submission.findUnique.mockResolvedValueOnce(submission);

      // act
      const result = await sut.findById(submission.id);

      // assert
      expect(prisma.submission.findUnique).toHaveBeenCalledWith({
        where: { id: submission.id },
        include: INCLUDE,
      });
      expect(result).toEqual(submission);
    });

    it('should return null when submission is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.submission.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findById(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should call prisma.submission.findMany with includes ordered by createdAt desc', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const submissions = [makeSubmissionRecord(), makeSubmissionRecord()];
      prisma.submission.findMany.mockResolvedValueOnce(submissions);

      // act
      const result = await sut.findAll();

      // assert
      expect(prisma.submission.findMany).toHaveBeenCalledWith({
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(submissions);
    });
  });

  describe('findByStudentId', () => {
    it('should call prisma.submission.findMany filtered by studentId', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const studentId = faker.string.uuid();
      const submissions = [makeSubmissionRecord({ studentId })];
      prisma.submission.findMany.mockResolvedValueOnce(submissions);

      // act
      const result = await sut.findByStudentId(studentId);

      // assert
      expect(prisma.submission.findMany).toHaveBeenCalledWith({
        where: { studentId },
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(submissions);
    });
  });

  describe('create', () => {
    it('should call prisma.submission.create with data and includes', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const data = {
        studentId: faker.string.uuid(),
        challengeId: faker.string.uuid(),
        code: 'console.log("hello")',
        language: 'javascript',
      };
      const submission = makeSubmissionRecord(data);
      prisma.submission.create.mockResolvedValueOnce(submission);

      // act
      const result = await sut.create(data);

      // assert
      expect(prisma.submission.create).toHaveBeenCalledWith({
        data,
        include: INCLUDE,
      });
      expect(result).toEqual(submission);
    });
  });

  describe('update', () => {
    it('should call prisma.submission.update with id and data', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const submission = makeSubmissionRecord();
      const data = { status: 'accepted', points: 10 };
      const updated = { ...submission, ...data };
      prisma.submission.update.mockResolvedValueOnce(updated);

      // act
      const result = await sut.update(submission.id, data);

      // assert
      expect(prisma.submission.update).toHaveBeenCalledWith({
        where: { id: submission.id },
        data,
        include: INCLUDE,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('findStudentByUserId', () => {
    it('should call prisma.student.findUnique with userId', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      const student = { id: faker.string.uuid(), userId };
      prisma.student.findUnique.mockResolvedValueOnce(student);

      // act
      const result = await sut.findStudentByUserId(userId);

      // assert
      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(student);
    });

    it('should return null when student is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.student.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findStudentByUserId(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });

  describe('findChallengeById', () => {
    it('should call prisma.challenge.findUnique with id', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const id = faker.string.uuid();
      const challenge = {
        id,
        title: faker.lorem.sentence(),
        difficulty: 'easy',
      };
      prisma.challenge.findUnique.mockResolvedValueOnce(challenge);

      // act
      const result = await sut.findChallengeById(id);

      // assert
      expect(prisma.challenge.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(challenge);
    });

    it('should return null when challenge is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.challenge.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findChallengeById(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });
});
