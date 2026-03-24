const { AppError } = require('../utils/AppError');

class ChallengeService {
  constructor(challengeRepository) {
    this.challengeRepository = challengeRepository;
  }

  async create(userId, data) {
    const teacher = await this.challengeRepository.findTeacherByUserId(userId);
    if (!teacher)
      throw new AppError(403, 'Only teachers can create challenges');

    const challenge = await this.challengeRepository.create({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty ?? 'medium',
      teacherId: teacher.id,
    });

    return this.toDTO(challenge);
  }

  async getAll() {
    const challenges = await this.challengeRepository.findAll();
    return challenges.map((c) => this.toDTO(c));
  }

  async getById(id) {
    const challenge = await this.challengeRepository.findById(id);
    if (!challenge) throw new AppError(404, 'Challenge not found');
    return this.toDTO(challenge);
  }

  async update(userId, role, id, data) {
    const challenge = await this.challengeRepository.findById(id);
    if (!challenge) throw new AppError(404, 'Challenge not found');

    if (role === 'teacher') {
      const teacher =
        await this.challengeRepository.findTeacherByUserId(userId);
      if (!teacher || challenge.teacherId !== teacher.id) {
        throw new AppError(403, 'You can only update your own challenges');
      }
    }

    const updated = await this.challengeRepository.update(id, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
    });

    return this.toDTO(updated);
  }

  async remove(userId, role, id) {
    const challenge = await this.challengeRepository.findById(id);
    if (!challenge) throw new AppError(404, 'Challenge not found');

    if (role === 'teacher') {
      const teacher =
        await this.challengeRepository.findTeacherByUserId(userId);
      if (!teacher || challenge.teacherId !== teacher.id) {
        throw new AppError(403, 'You can only delete your own challenges');
      }
    }

    await this.challengeRepository.remove(id);
  }

  toDTO(challenge) {
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      teacher: {
        id: challenge.teacher.id,
        name: challenge.teacher.user.name,
      },
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    };
  }
}

module.exports = { ChallengeService };
