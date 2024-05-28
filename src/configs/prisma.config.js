const { PrismaClient } = require('@prisma/client')
const {} = require('prisma')

class Prisma {
    constructor() {
        this.client = new PrismaClient({
            datasources: {
                db: {
                    url: global.config.get('MYSQL_URL'),
                },
            },
        })
    }
}

module.exports = new Prisma().client
