const { faker } = require('@faker-js/faker');
const { TurmaService } = require('../../services/turma.service');
const { AppError } = require('../../utils/AppError');

describe('TurmaService', () => {
  const makeTeacher = (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    ...overrides,
  });

  const makeTurmaRecord = (overrides = {}) => {
    const teacher = makeTeacher();
    return {
      id: faker.string.uuid(),
      name: 'Turma A',
      teacherId: teacher.id,
      teacher: { id: teacher.id, user: { name: faker.person.fullName() } },
      students: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  const makeStudentRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    turmaId: null,
    ...overrides,
  });

  class TurmaRepositoryStub {
    constructor() {
      this._teacher = makeTeacher();
      this._turma = makeTurmaRecord({ teacherId: this._teacher.id });
      this._student = makeStudentRecord();
    }

    async findTeacherByUserId() {
      return this._teacher;
    }

    async findById() {
      return this._turma;
    }

    async findAll() {
      return [this._turma];
    }

    async findByTeacherId() {
      return [this._turma];
    }

    async create(data) {
      return { ...this._turma, ...data };
    }

    async update(id, data) {
      return { ...this._turma, ...data };
    }

    async remove() {}

    async addStudent() {}

    async removeStudent() {}

    async findStudentById() {
      return this._student;
    }
  }

  const makeSut = () => {
    const turmaRepository = new TurmaRepositoryStub();
    const sut = new TurmaService(turmaRepository);
    return { sut, turmaRepository };
  };

  describe('create', () => {
    it('should throw AppError 403 when user has no teacher record', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.create(faker.string.uuid(), { name: 'Turma A' }),
      ).rejects.toThrow(new AppError(403, 'Only teachers can create turmas'));
    });

    it('should return a DTO on success', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.create(faker.string.uuid(), { name: 'Turma A' });

      // assert
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      );
    });
  });

  describe('getAll', () => {
    it('should return only own turmas when role is teacher', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      const spy = jest.spyOn(turmaRepository, 'findByTeacherId');

      // act
      await sut.getAll(faker.string.uuid(), 'teacher');

      // assert
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when teacher has no record', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);

      // act
      const result = await sut.getAll(faker.string.uuid(), 'teacher');

      // assert
      expect(result).toEqual([]);
    });

    it('should return all turmas when role is admin', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      const spy = jest.spyOn(turmaRepository, 'findAll');

      // act
      await sut.getAll(faker.string.uuid(), 'admin');

      // assert
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should throw AppError 404 when turma is not found', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest.spyOn(turmaRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.getById(faker.string.uuid())).rejects.toThrow(
        new AppError(404, 'Turma not found'),
      );
    });

    it('should return DTO when found', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getById(faker.string.uuid());

      // assert
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      );
    });
  });

  describe('update', () => {
    it('should throw AppError 404 when turma is not found', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest.spyOn(turmaRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.update(faker.string.uuid(), 'admin', faker.string.uuid(), {
          name: 'B',
        }),
      ).rejects.toThrow(new AppError(404, 'Turma not found'));
    });

    it('should throw AppError 403 when teacher does not own the turma', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      const otherTeacher = makeTeacher();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(otherTeacher);

      // act / assert
      await expect(
        sut.update(faker.string.uuid(), 'teacher', faker.string.uuid(), {
          name: 'B',
        }),
      ).rejects.toThrow(
        new AppError(403, 'You can only update your own turmas'),
      );
    });

    it('should allow admin to update any turma', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.update(
        faker.string.uuid(),
        'admin',
        faker.string.uuid(),
        {
          name: 'B',
        },
      );

      // assert
      expect(result).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      );
    });

    it('should allow teacher to update own turma', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(
          makeTeacher({ id: turmaRepository._turma.teacherId }),
        );

      // act
      const result = await sut.update(
        faker.string.uuid(),
        'teacher',
        faker.string.uuid(),
        {
          name: 'B',
        },
      );

      // assert
      expect(result).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      );
    });
  });

  describe('remove', () => {
    it('should throw AppError 404 when turma is not found', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest.spyOn(turmaRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.remove(faker.string.uuid(), 'admin', faker.string.uuid()),
      ).rejects.toThrow(new AppError(404, 'Turma not found'));
    });

    it('should throw AppError 403 when teacher does not own the turma', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      const otherTeacher = makeTeacher();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(otherTeacher);

      // act / assert
      await expect(
        sut.remove(faker.string.uuid(), 'teacher', faker.string.uuid()),
      ).rejects.toThrow(
        new AppError(403, 'You can only remove your own turmas'),
      );
    });

    it('should throw AppError 403 when teacher record is null', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.remove(faker.string.uuid(), 'teacher', faker.string.uuid()),
      ).rejects.toThrow(
        new AppError(403, 'You can only remove your own turmas'),
      );
    });

    it('should call repository.remove when authorized', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      const removeSpy = jest.spyOn(turmaRepository, 'remove');

      // act
      await sut.remove(faker.string.uuid(), 'admin', faker.string.uuid());

      // assert
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow teacher to remove own turma', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(
          makeTeacher({ id: turmaRepository._turma.teacherId }),
        );
      const removeSpy = jest.spyOn(turmaRepository, 'remove');

      // act
      await sut.remove(faker.string.uuid(), 'teacher', faker.string.uuid());

      // assert
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('addStudent', () => {
    it('should throw AppError 404 when turma is not found', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest.spyOn(turmaRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.addStudent(
          faker.string.uuid(),
          'admin',
          faker.string.uuid(),
          faker.string.uuid(),
        ),
      ).rejects.toThrow(new AppError(404, 'Turma not found'));
    });

    it('should throw AppError 403 when teacher does not own the turma', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(makeTeacher());

      // act / assert
      await expect(
        sut.addStudent(
          faker.string.uuid(),
          'teacher',
          faker.string.uuid(),
          faker.string.uuid(),
        ),
      ).rejects.toThrow(
        new AppError(403, 'You can only manage your own turmas'),
      );
    });

    it('should throw AppError 403 when teacher record is null', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.addStudent(
          faker.string.uuid(),
          'teacher',
          faker.string.uuid(),
          faker.string.uuid(),
        ),
      ).rejects.toThrow(
        new AppError(403, 'You can only manage your own turmas'),
      );
    });

    it('should throw AppError 404 when student is not found', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findStudentById')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.addStudent(
          faker.string.uuid(),
          'admin',
          faker.string.uuid(),
          faker.string.uuid(),
        ),
      ).rejects.toThrow(new AppError(404, 'Student not found'));
    });

    it('should call repository.addStudent on success', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      const addStudentSpy = jest.spyOn(turmaRepository, 'addStudent');

      // act
      await sut.addStudent(
        faker.string.uuid(),
        'admin',
        faker.string.uuid(),
        faker.string.uuid(),
      );

      // assert
      expect(addStudentSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow teacher to add student to own turma', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(
          makeTeacher({ id: turmaRepository._turma.teacherId }),
        );
      const addStudentSpy = jest.spyOn(turmaRepository, 'addStudent');

      // act
      await sut.addStudent(
        faker.string.uuid(),
        'teacher',
        faker.string.uuid(),
        faker.string.uuid(),
      );

      // assert
      expect(addStudentSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeStudent', () => {
    it('should throw AppError 404 when turma is not found', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest.spyOn(turmaRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.removeStudent(
          faker.string.uuid(),
          'admin',
          faker.string.uuid(),
          faker.string.uuid(),
        ),
      ).rejects.toThrow(new AppError(404, 'Turma not found'));
    });

    it('should throw AppError 403 when teacher does not own the turma', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      const otherTeacher = makeTeacher();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(otherTeacher);

      // act / assert
      await expect(
        sut.removeStudent(
          faker.string.uuid(),
          'teacher',
          faker.string.uuid(),
          faker.string.uuid(),
        ),
      ).rejects.toThrow(
        new AppError(403, 'You can only manage your own turmas'),
      );
    });

    it('should throw AppError 403 when teacher record is null', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.removeStudent(
          faker.string.uuid(),
          'teacher',
          faker.string.uuid(),
          faker.string.uuid(),
        ),
      ).rejects.toThrow(
        new AppError(403, 'You can only manage your own turmas'),
      );
    });

    it('should throw AppError 404 when student is not found', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findStudentById')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.removeStudent(
          faker.string.uuid(),
          'admin',
          faker.string.uuid(),
          faker.string.uuid(),
        ),
      ).rejects.toThrow(new AppError(404, 'Student not found'));
    });

    it('should throw AppError 400 when student is not in this class', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      jest
        .spyOn(turmaRepository, 'findStudentById')
        .mockResolvedValueOnce(
          makeStudentRecord({ turmaId: faker.string.uuid() }),
        );
      const turmaId = faker.string.uuid();

      // act / assert
      await expect(
        sut.removeStudent(
          faker.string.uuid(),
          'admin',
          turmaId,
          faker.string.uuid(),
        ),
      ).rejects.toThrow(new AppError(400, 'Student is not in this class'));
    });

    it('should call repository.removeStudent on success', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      const turmaId = turmaRepository._turma.id;
      jest
        .spyOn(turmaRepository, 'findStudentById')
        .mockResolvedValueOnce(makeStudentRecord({ turmaId }));
      jest
        .spyOn(turmaRepository, 'findById')
        .mockResolvedValueOnce({ ...turmaRepository._turma, id: turmaId });
      const removeStudentSpy = jest.spyOn(turmaRepository, 'removeStudent');

      // act
      await sut.removeStudent(
        faker.string.uuid(),
        'admin',
        turmaId,
        faker.string.uuid(),
      );

      // assert
      expect(removeStudentSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow teacher to remove student from own turma', async () => {
      // arrange
      const { sut, turmaRepository } = makeSut();
      const turmaId = turmaRepository._turma.id;
      jest
        .spyOn(turmaRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(
          makeTeacher({ id: turmaRepository._turma.teacherId }),
        );
      jest
        .spyOn(turmaRepository, 'findById')
        .mockResolvedValueOnce({ ...turmaRepository._turma, id: turmaId });
      jest
        .spyOn(turmaRepository, 'findStudentById')
        .mockResolvedValueOnce(makeStudentRecord({ turmaId }));
      const removeStudentSpy = jest.spyOn(turmaRepository, 'removeStudent');

      // act
      await sut.removeStudent(
        faker.string.uuid(),
        'teacher',
        turmaId,
        faker.string.uuid(),
      );

      // assert
      expect(removeStudentSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('toDTO', () => {
    it('should map students array when turma has students', () => {
      // arrange
      const { sut } = makeSut();
      const student = {
        id: faker.string.uuid(),
        user: { name: faker.person.fullName() },
      };
      const turma = makeTurmaRecord({ students: [student] });

      // act
      const result = sut.toDTO(turma);

      // assert
      expect(result.students).toEqual([
        { id: student.id, name: student.user.name },
      ]);
    });
  });
});
