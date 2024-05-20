const helmet = require('helmet')
const compression = require('compression')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const config = require('./configs/index')
// init middleware
app.use(helmet()) // secure app by setting various HTTP headers
app.use(compression()) // compress all responses
app.use(express.json()) // parse application/json
app.use(express.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
// config morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
app.use(morgan(morganFormat)) // log requests to the console
// config cors
app.use(cors()) // enable cors
// init global variable
global.config = config
global.logger = require('./services/logger.service')
// connect to database MySQL
const MySQLConnection = require('./configs/mySQL.config')
MySQLConnection.connect()
global.mySQLConnection = MySQLConnection
// connect to database Redis
const RedisConnection = require('./configs/redis.config')
RedisConnection.connect()
// test fnc
// require('./test/index').connectDB()
// handle error
app.use((req, res, next) => {
    const error = new Error('Not found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
    })
})

app.get('/', (req, res) => {
    res.json({
        status: 'success',
        code: 200,
        message: 'Hello',
    })
})
//init route
app.use('/v1/api', require('./routes/index'))

module.exports = app
