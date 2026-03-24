const { AppError } = require('../utils/AppError');

const DIFFICULTY_POINTS = { easy: 10, medium: 20, hard: 30 };

class SubmissionService {
  constructor(submissionRepository) {
    this.submissionRepository = submissionRepository;
  }

  async submit(userId, data) {
    const student = await this.submissionRepository.findStudentByUserId(userId);
    if (!student) throw new AppError(403, 'Only students can submit code');

    const challenge = await this.submissionRepository.findChallengeById(
      data.challengeId,
    );
    if (!challenge) throw new AppError(404, 'Challenge not found');

    const submission = await this.submissionRepository.create({
      studentId: student.id,
      challengeId: data.challengeId,
      code: data.code,
      language: data.language,
    });

    return this.toDTO(submission);
  }

  async getAll(userId, role) {
    if (role === 'student') {
      const student =
        await this.submissionRepository.findStudentByUserId(userId);
      if (!student) return [];
      const submissions = await this.submissionRepository.findByStudentId(
        student.id,
      );
      return submissions.map((s) => this.toDTO(s));
    }

    const submissions = await this.submissionRepository.findAll();
    return submissions.map((s) => this.toDTO(s));
  }

  async getById(userId, role, id) {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) throw new AppError(404, 'Submission not found');

    if (role === 'student') {
      const student =
        await this.submissionRepository.findStudentByUserId(userId);
      if (!student || submission.studentId !== student.id) {
        throw new AppError(403, 'You can only view your own submissions');
      }
    }

    return this.toDTO(submission);
  }

  async evaluate(id, data) {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) throw new AppError(404, 'Submission not found');

    const points =
      data.status === 'accepted'
        ? (data.points ??
          DIFFICULTY_POINTS[submission.challenge.difficulty] ??
          10)
        : 0;

    const updated = await this.submissionRepository.update(id, {
      status: data.status,
      points,
      ...(data.feedback !== undefined && { feedback: data.feedback }),
    });

    return this.toDTO(updated);
  }

  toDTO(submission) {
    return {
      id: submission.id,
      student: {
        id: submission.student.id,
        name: submission.student.user.name,
      },
      challenge: {
        id: submission.challenge.id,
        title: submission.challenge.title,
        difficulty: submission.challenge.difficulty,
      },
      code: submission.code,
      language: submission.language,
      status: submission.status,
      points: submission.points,
      feedback: submission.feedback,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }
}

module.exports = { SubmissionService };
