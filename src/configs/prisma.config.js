const { PrismaClient } = require('@prisma/client')
const {} = require('prisma')

class Prisma {
    constructor() {
        if (!Prisma.instance) {
            this.client = new PrismaClient({
                datasources: {
                    db: {
                        url: global.config.get('MYSQL_URL'),
                    },
                },
            })
            Prisma.instance = this
        }
        return Prisma.instance
    }
}

module.exports = new Prisma().client
