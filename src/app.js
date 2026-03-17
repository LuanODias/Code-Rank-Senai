const express = require('express');
const { toNodeHandler } = require('better-auth/node');
const { getAuth } = require('./config/auth');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const auth = getAuth();
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
