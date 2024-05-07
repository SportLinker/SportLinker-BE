const winston = require('winston')
const time = require('../helpers/timestamp.helper')
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.json()),
    transports: [
        new winston.transports.Console({
            format: winston.format.printf(
                // format log : [time] [level] [message]
                (info) => `[${time.getNow()}] [${info.level}] ${info.message}`,
            ),
        }),
        new winston.transports.File({
            filename: `src/logs/${time.getNowDate()}.log`,
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                winston.format.json()
            ),
        }),
    ],
})
module.exports = logger