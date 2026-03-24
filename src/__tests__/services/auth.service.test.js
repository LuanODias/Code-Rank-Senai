const { faker } = require('@faker-js/faker');
const { AuthService } = require('../../services/auth.service');
const { AppError } = require('../../utils/AppError');

jest.mock('better-auth/node', () => ({
  fromNodeHeaders: jest.fn((headers) => headers),
}));

describe('AuthService', () => {
  const makeUser = (role = 'teacher') => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role,
  });

  const makeTeacher = (mustChangePassword = false) => ({
    id: faker.string.uuid(),
    mustChangePassword,
  });

  class AuthRepositoryStub {
    async findTeacherByUserId() {
      return makeTeacher();
    }

    async clearMustChangePassword() {}
  }

  const makeAuth = (signInResult) => ({
    api: {
      signInEmail: jest.fn().mockResolvedValue(signInResult),
      signOut: jest.fn().mockResolvedValue(undefined),
      changePassword: jest.fn().mockResolvedValue(undefined),
    },
  });

  const makeSut = (signInResult = { user: makeUser(), token: 'token' }) => {
    const auth = makeAuth(signInResult);
    const authRepository = new AuthRepositoryStub();
    const sut = new AuthService(auth, authRepository);
    return { sut, auth, authRepository };
  };

  describe('login', () => {
    it('should throw AppError 401 when auth returns no result', async () => {
      // arrange
      const { sut } = makeSut(null);

      // act / assert
      await expect(sut.login('email@test.com', 'pass')).rejects.toThrow(
        new AppError(401, 'Invalid credentials'),
      );
    });

    it('should call auth.api.signInEmail with correct params', async () => {
      // arrange
      const email = faker.internet.email();
      const password = faker.internet.password();
      const { sut, auth } = makeSut();

      // act
      await sut.login(email, password);

      // assert
      expect(auth.api.signInEmail).toHaveBeenCalledWith({
        body: { email, password },
      });
    });

    it('should fetch teacher and return mustChangePassword for teacher role', async () => {
      // arrange
      const user = makeUser('teacher');
      const { sut, authRepository } = makeSut({ user, token: 'token' });
      jest
        .spyOn(authRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(makeTeacher(true));

      // act
      const result = await sut.login(user.email, 'password');

      // assert
      expect(authRepository.findTeacherByUserId).toHaveBeenCalledWith(user.id);
      expect(result.user.mustChangePassword).toBe(true);
    });

    it('should return mustChangePassword false when teacher record is not found', async () => {
      // arrange
      const user = makeUser('teacher');
      const { sut, authRepository } = makeSut({ user, token: 'token' });
      jest
        .spyOn(authRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);

      // act
      const result = await sut.login(user.email, 'password');

      // assert
      expect(result.user.mustChangePassword).toBe(false);
    });

    it('should not call findTeacherByUserId for non-teacher role', async () => {
      // arrange
      const user = makeUser('admin');
      const { sut, authRepository } = makeSut({ user, token: 'token' });
      const findSpy = jest.spyOn(authRepository, 'findTeacherByUserId');

      // act
      const result = await sut.login(user.email, 'password');

      // assert
      expect(findSpy).not.toHaveBeenCalled();
      expect(result.user.mustChangePassword).toBe(false);
    });

    it('should return user data and token on success', async () => {
      // arrange
      const user = makeUser('admin');
      const token = faker.string.alphanumeric(64);
      const { sut } = makeSut({ user, token });

      // act
      const result = await sut.login(user.email, 'password');

      // assert
      expect(result).toEqual({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: false,
        },
        token,
      });
    });
  });

  describe('logout', () => {
    it('should call auth.api.signOut with headers', async () => {
      // arrange
      const { sut, auth } = makeSut();
      const headers = { authorization: 'Bearer token' };

      // act
      await sut.logout(headers);

      // assert
      expect(auth.api.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('changePassword', () => {
    const makeRequest = () => ({
      userId: faker.string.uuid(),
      currentPassword: faker.internet.password(),
      newPassword: faker.internet.password(),
      headers: { authorization: 'Bearer token' },
    });

    it('should call auth.api.changePassword with correct params', async () => {
      // arrange
      const { sut, auth } = makeSut();
      const { userId, currentPassword, newPassword, headers } = makeRequest();

      // act
      await sut.changePassword(userId, currentPassword, newPassword, headers);

      // assert
      expect(auth.api.changePassword).toHaveBeenCalledWith({
        body: { currentPassword, newPassword, revokeOtherSessions: false },
        headers,
      });
    });

    it('should clear mustChangePassword when teacher has it set', async () => {
      // arrange
      const { sut, authRepository } = makeSut();
      const { userId, currentPassword, newPassword, headers } = makeRequest();
      jest
        .spyOn(authRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(makeTeacher(true));
      const clearSpy = jest.spyOn(authRepository, 'clearMustChangePassword');

      // act
      await sut.changePassword(userId, currentPassword, newPassword, headers);

      // assert
      expect(clearSpy).toHaveBeenCalledWith(userId);
    });

    it('should not clear mustChangePassword when teacher does not have it set', async () => {
      // arrange
      const { sut, authRepository } = makeSut();
      const { userId, currentPassword, newPassword, headers } = makeRequest();
      jest
        .spyOn(authRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(makeTeacher(false));
      const clearSpy = jest.spyOn(authRepository, 'clearMustChangePassword');

      // act
      await sut.changePassword(userId, currentPassword, newPassword, headers);

      // assert
      expect(clearSpy).not.toHaveBeenCalled();
    });

    it('should not clear mustChangePassword when user is not a teacher', async () => {
      // arrange
      const { sut, authRepository } = makeSut();
      const { userId, currentPassword, newPassword, headers } = makeRequest();
      jest
        .spyOn(authRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);
      const clearSpy = jest.spyOn(authRepository, 'clearMustChangePassword');

      // act
      await sut.changePassword(userId, currentPassword, newPassword, headers);

      // assert
      expect(clearSpy).not.toHaveBeenCalled();
    });

    it('should return success message', async () => {
      // arrange
      const { sut } = makeSut();
      const { userId, currentPassword, newPassword, headers } = makeRequest();

      // act
      const result = await sut.changePassword(
        userId,
        currentPassword,
        newPassword,
        headers,
      );

      // assert
      expect(result).toEqual({ message: 'Password changed successfully.' });
    });
  });
});
