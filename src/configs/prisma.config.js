const { PrismaClient } = require('@prisma/client')
const LoggerService = require('../services/logger.service')

class Prisma {
    logger = new LoggerService({ className: this.className })
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
                this.logger.info('Connected to database')
            })
            .catch((error) => {
                console.log('Error connecting to database', error)
                this.logger.error(`Err connecting MySQL`, error.message)
            })
    }
}

module.exports = new Prisma()
