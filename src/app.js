const helmet = require('helmet');
const compression = require('compression');
const express = require('express');
const app = express();
const morgan = require('morgan');
const config = require('./configs/index');
// init middleware
app.use(helmet()); // secure app by setting various HTTP headers
app.use(compression()); // compress all responses
app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
// config morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat)); // log requests to the console
// init global variable
global.config = config;
global.logger = require('./services/logger.service');
//init route
app.use('/v1/api', require('./routes/index'));
// init db
require('./dbs/init.mongoDB');


module.exports = app;