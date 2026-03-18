const { AppError } = require('../utils/AppError');

const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const isDev = process.env.NODE_ENV !== 'production';

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.error(err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    ...(isDev && { message: err.message, stack: err.stack }),
  });
};

module.exports = { errorHandler };
