const winston = require('winston')
const time = require('../helpers/timestamp.helper')
const { customLevels, loggerAppConfig } = require('../utils/logger.util')

class Logger {
    constructor({ app = 'app', className = 'Unknown' }) {
        this.className = className

        this.logger = winston.createLogger({
            levels: customLevels.levels, // Use custom levels
            format: winston.format.combine(winston.format.json()),
            transports: [
                new winston.transports.Console({
                    format: winston.format.printf(
                        // Format log : [time] [level] [className] [message]
                        (info) => {
                            return `[${time.getTimeByFormat(
                                'YYYY-MM-DD hh:mm:ss'
                            )}] [${info.level.toUpperCase()}] [${this.className}] ${
                                info.message
                            }`
                        }
                    ),
                }),
                new winston.transports.File({
                    filename: `logs/${loggerAppConfig[app]}/${time.getTimeByFormat(
                        'YYYY/MM/YYYY-MM-DD'
                    )}.log`,
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: 'YYYY-MM-DD HH:mm:ss',
                        }),
                        // Tùy chỉnh format để thêm className vào log file
                        winston.format.printf((info) => {
                            return `[${info.timestamp}] [${info.level.toUpperCase()}] [${
                                this.className
                            }] ${info.message}`
                        })
                    ),
                }),
            ],
        })

        // create a new instance of the logger with the new configuration
        Object.keys(this.logger.levels).forEach((level) => {
            this[level] = (message) => {
                this.logger.log(level, message)
            }
        })
    }
}

module.exports = Logger
