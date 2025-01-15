const { PrismaClient } = require('@prisma/client')
const LoggerService = require('../services/logger.service')

class MySQLConnection {
    logger = new LoggerService({ className: 'MySQLConnection' })
    constructor() {
        if (!MySQLConnection.instance) {
            this.client = new PrismaClient({
                datasources: {
                    db: {
                        url: global.config.get('MYSQL_URL'),
                    },
                },
                log: [
                    'warn',
                    'error',
                    {
                        level: 'info',
                        emit: 'event',
                    },
                ],
            })
            MySQLConnection.instance = this
        }
        return MySQLConnection.instance
    }

    async connect() {
        await this.client
            .$connect()
            .then(() => {
                this.logger.info('Connected to database')
            })
            .catch((error) => {
                console.log('Error connecting to database', error)
                this.logger.error(`Err connecting MySQL`, error.message)
            })
    }
}

module.exports = new MySQLConnection()
