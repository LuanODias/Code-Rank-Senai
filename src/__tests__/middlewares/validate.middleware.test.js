const { z } = require('zod');
const { validate } = require('../../middlewares/validate');

describe('validate middleware', () => {
  const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const makeNext = () => jest.fn();

  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
  });

  describe('when validation passes', () => {
    it('should call next without arguments', () => {
      // arrange
      const req = { body: { name: 'João', email: 'joao@senai.com' } };
      const res = makeRes();
      const next = makeNext();

      // act
      validate(schema)(req, res, next);

      // assert
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should replace req.body with the parsed data', () => {
      // arrange
      const req = {
        body: { name: 'João', email: 'joao@senai.com', extra: 'stripped' },
      };
      const res = makeRes();
      const next = makeNext();

      // act
      validate(schema)(req, res, next);

      // assert
      expect(req.body).toEqual({ name: 'João', email: 'joao@senai.com' });
      expect(req.body).not.toHaveProperty('extra');
    });

    it('should apply schema defaults to req.body', () => {
      // arrange
      const schemaWithDefault = z.object({
        difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
      });
      const req = { body: {} };
      const res = makeRes();
      const next = makeNext();

      // act
      validate(schemaWithDefault)(req, res, next);

      // assert
      expect(req.body.difficulty).toBe('medium');
    });
  });

  describe('when validation fails', () => {
    it('should return 400 with the first error message', () => {
      // arrange
      const req = { body: { name: '', email: 'not-an-email' } };
      const res = makeRes();
      const next = makeNext();

      // act
      validate(schema)(req, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return the custom error message from the schema', () => {
      // arrange
      const req = { body: { name: '', email: 'joao@senai.com' } };
      const res = makeRes();
      const next = makeNext();

      // act
      validate(schema)(req, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith({ error: 'Name is required' });
    });

    it('should return a generic message when schema provides no message', () => {
      // arrange — schema whose safeParse returns success: false with no issue message
      const emptySchema = {
        safeParse: () => ({
          success: false,
          error: { issues: [] },
        }),
      };
      const req = { body: {} };
      const res = makeRes();
      const next = makeNext();

      // act
      validate(emptySchema)(req, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation error' });
    });

    it('should not call next when validation fails', () => {
      // arrange
      const req = { body: {} };
      const res = makeRes();
      const next = makeNext();

      // act
      validate(schema)(req, res, next);

      // assert
      expect(next).not.toHaveBeenCalled();
    });
  });
});
