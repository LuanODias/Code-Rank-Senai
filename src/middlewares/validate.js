const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Validation error';
    res.status(400).json({ error: message });
    return;
  }

  req.body = result.data;
  next();
};

module.exports = { validate };
