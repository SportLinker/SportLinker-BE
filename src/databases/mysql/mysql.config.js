const { PrismaClient } = require('@prisma/client')
const Logger = require('../../loggers/logger.config')

class MySQL {
    logger = new Logger({ className: 'MySQL' })
    constructor() {
        if (!MySQL.instance) {
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
            MySQL.instance = this
        }
        return MySQL.instance
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

module.exports = new MySQL()
