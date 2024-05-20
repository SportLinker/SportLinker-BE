const { PrismaClient } = require('@prisma/client')

class Prisma {
    constructor() {
        this.client = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        })
    }
}

module.exports = new Prisma().client
