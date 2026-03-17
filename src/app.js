const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { toNodeHandler } = require('better-auth/node');
const { getAuth } = require('./config/auth');
const { swaggerSpec } = require('./config/swagger');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const auth = getAuth();
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
