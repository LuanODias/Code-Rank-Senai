const { faker } = require('@faker-js/faker');
const { TurmaRepository } = require('../../repositories/turma.repository');

describe('TurmaRepository', () => {
  const INCLUDE = {
    teacher: { include: { user: true } },
    students: { include: { user: true } },
  };

  const makeTurmaRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.lorem.word(),
    teacherId: faker.string.uuid(),
    teacher: {
      id: faker.string.uuid(),
      user: { name: faker.person.fullName() },
    },
    students: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const makeStudentRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    turmaId: null,
    ...overrides,
  });

  const makePrisma = () => ({
    turma: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
    },
  });

  const makeSut = () => {
    const prisma = makePrisma();
    const sut = new TurmaRepository(prisma);
    return { sut, prisma };
  };

  describe('findById', () => {
    it('should call prisma.turma.findUnique with id and includes', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const turma = makeTurmaRecord();
      prisma.turma.findUnique.mockResolvedValueOnce(turma);

      // act
      const result = await sut.findById(turma.id);

      // assert
      expect(prisma.turma.findUnique).toHaveBeenCalledWith({
        where: { id: turma.id },
        include: INCLUDE,
      });
      expect(result).toEqual(turma);
    });

    it('should return null when turma is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.turma.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findById(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should call prisma.turma.findMany with includes ordered by createdAt desc', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const turmas = [makeTurmaRecord(), makeTurmaRecord()];
      prisma.turma.findMany.mockResolvedValueOnce(turmas);

      // act
      const result = await sut.findAll();

      // assert
      expect(prisma.turma.findMany).toHaveBeenCalledWith({
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(turmas);
    });
  });

  describe('findByTeacherId', () => {
    it('should call prisma.turma.findMany filtered by teacherId', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const teacherId = faker.string.uuid();
      const turmas = [makeTurmaRecord({ teacherId })];
      prisma.turma.findMany.mockResolvedValueOnce(turmas);

      // act
      const result = await sut.findByTeacherId(teacherId);

      // assert
      expect(prisma.turma.findMany).toHaveBeenCalledWith({
        where: { teacherId },
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(turmas);
    });
  });

  describe('create', () => {
    it('should call prisma.turma.create with data and includes', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const data = { name: 'Turma A', teacherId: faker.string.uuid() };
      const turma = makeTurmaRecord(data);
      prisma.turma.create.mockResolvedValueOnce(turma);

      // act
      const result = await sut.create(data);

      // assert
      expect(prisma.turma.create).toHaveBeenCalledWith({
        data,
        include: INCLUDE,
      });
      expect(result).toEqual(turma);
    });
  });

  describe('update', () => {
    it('should call prisma.turma.update with id, data and includes', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const turma = makeTurmaRecord();
      const data = { name: 'Turma B' };
      const updated = { ...turma, ...data };
      prisma.turma.update.mockResolvedValueOnce(updated);

      // act
      const result = await sut.update(turma.id, data);

      // assert
      expect(prisma.turma.update).toHaveBeenCalledWith({
        where: { id: turma.id },
        data,
        include: INCLUDE,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call prisma.turma.delete with id', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const id = faker.string.uuid();
      prisma.turma.delete.mockResolvedValueOnce({});

      // act
      await sut.remove(id);

      // assert
      expect(prisma.turma.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('addStudent', () => {
    it('should call prisma.student.update with studentId and turmaId', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const turmaId = faker.string.uuid();
      const studentId = faker.string.uuid();
      prisma.student.update.mockResolvedValueOnce({});

      // act
      await sut.addStudent(turmaId, studentId);

      // assert
      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: studentId },
        data: { turmaId },
      });
    });
  });

  describe('removeStudent', () => {
    it('should call prisma.student.update setting turmaId to null', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const studentId = faker.string.uuid();
      prisma.student.update.mockResolvedValueOnce({});

      // act
      await sut.removeStudent(studentId);

      // assert
      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: studentId },
        data: { turmaId: null },
      });
    });
  });

  describe('findStudentById', () => {
    it('should call prisma.student.findUnique with id', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const student = makeStudentRecord();
      prisma.student.findUnique.mockResolvedValueOnce(student);

      // act
      const result = await sut.findStudentById(student.id);

      // assert
      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: student.id },
      });
      expect(result).toEqual(student);
    });
  });

  describe('findTeacherByUserId', () => {
    it('should call prisma.teacher.findUnique with userId', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const userId = faker.string.uuid();
      const teacher = { id: faker.string.uuid(), userId };
      prisma.teacher.findUnique.mockResolvedValueOnce(teacher);

      // act
      const result = await sut.findTeacherByUserId(userId);

      // assert
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(teacher);
    });
  });
});
