const { getAuth } = require('../config/auth');
const { AuthService } = require('../services/auth.service');
const { AuthController } = require('../controllers/auth.controller');

const makeAuthController = () => {
  const auth = getAuth();
  const service = new AuthService(auth);
  return new AuthController(service);
};

module.exports = { makeAuthController };
