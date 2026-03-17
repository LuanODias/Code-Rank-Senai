const { AppError } = require('../utils/AppError');

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = { errorHandler };
