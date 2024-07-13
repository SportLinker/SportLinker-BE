const { PrismaClient } = require('@prisma/client')

class Prisma {
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
                global.logger.info('Connected to database')
            })
            .catch((error) => {
                global.logger.error(`Err connecting MySQL`, error.message)
            })
    }
}

module.exports = new Prisma()
