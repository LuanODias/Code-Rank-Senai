const { AppError } = require('../utils/AppError');

class TeacherService {
  constructor(teacherRepository, auth) {
    this.teacherRepository = teacherRepository;
    this.auth = auth;
  }

  async create(data) {
    const existing = await this.teacherRepository.findByEmail(data.email);
    if (existing) throw new AppError(409, 'Email already in use');

    const result = await this.auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    await this.teacherRepository.updateUserRole(result.user.id, 'teacher');

    const teacher = await this.teacherRepository.create(result.user.id);
    return this.toDTO(teacher);
  }

  async getAll() {
    const teachers = await this.teacherRepository.findAll();
    return teachers.map((t) => this.toDTO(t));
  }

  async getById(id) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) throw new AppError(404, 'Teacher not found');
    return this.toDTO(teacher);
  }

  async update(id, data) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) throw new AppError(404, 'Teacher not found');
    const updated = await this.teacherRepository.update(id, data);
    return this.toDTO(updated);
  }

  async remove(id) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) throw new AppError(404, 'Teacher not found');
    await this.teacherRepository.remove(id);
  }

  toDTO(teacher) {
    return {
      id: teacher.id,
      userId: teacher.userId,
      name: teacher.user.name,
      email: teacher.user.email,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }
}

module.exports = { TeacherService };
