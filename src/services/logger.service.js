const winston = require('winston')
const time = require('../helpers/timestamp.helper')

// Define custom log levels
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
    },
}
// Apply the colors to the logger

const logger = winston.createLogger({
    levels: customLevels.levels, // Use custom levels
    format: winston.format.combine(winston.format.json()),
    transports: [
        new winston.transports.Console({
            format: winston.format.printf(
                // Format log : [time] [level] [message]
                (info) => {
                    return `[${time.getTimeByFormat(
                        'YYYY-MM-DD hh:mm:ss'
                    )}] [${info.level.toUpperCase()}] ${info.message}`
                }
            ),
        }),
        new winston.transports.File({
            filename: `logs/${time.getTimeByFormat('YYYY/MM/YYYY-MM-DD')}.log`,
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
