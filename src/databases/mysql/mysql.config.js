const { PrismaClient } = require('@prisma/client')
const LoggerService = require('../services/logger.service')
const logger = new LoggerService({ className: 'Prisma' })

class MySQL {
    constructor() {
        if (!Prisma.instance) {
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
            Prisma.instance = this
        }
        return Prisma.instance
    }

    async connect() {
        await this.client
            .$connect()
            .then(() => {
                logger.info('Connected to database')
            })
            .catch((error) => {
                logger.error(`Err connecting MySQL`, error.message)
            })
    }
}

module.exports = new Prisma()
