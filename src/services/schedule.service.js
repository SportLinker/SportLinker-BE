const schedule = require('node-schedule')
const prisma = require('../configs/prisma.config').client

const listScheduleTime = {
    validTimeMatch: '30 * * * *',
    // every 5 minutes
    validTransaction: '*/5 * * * *',
}

const runSchedule = () => {
    // check list match is out of date
    schedule.scheduleJob(listScheduleTime.validTimeMatch, async () => {
        // get list match is running < date
        const list_match = await prisma.match
            .findMany({
                where: {
                    start_time: {
                        lt: new Date(),
                    },
                    status: 'upcomming',
                },
            })
            .catch((err) => {
                global.logger.error(
                    `Schedule, get list match is running < date error: ${err.message}`
                )
                return []
            })
        // set status to complete
        for (let i = 0; i < list_match.length; i++) {
            await prisma.match.update({
                where: {
                    match_id: list_match[i].match_id,
                },
                data: {
                    status: 'completed',
                },
            })
        }

        global.logger.info(`Schedule, set status match to completed`)
    })

    // check list transaction is out of date
    schedule.scheduleJob(listScheduleTime.validTransaction, async () => {
        // get list transaction is pending and expired
        const list_transaction = await prisma.transaction
            .findMany({
                where: {
                    expired_at: {
                        lt: new Date(),
                    },
                    status: 'pending',
                },
            })
            .catch((err) => {
                global.logger.error(
                    `Schedule, get list transaction is pending and expired error: ${err.message}`
                )
                return []
            })
        // set status to cancel
        for (let i = 0; i < list_transaction.length; i++) {
            await prisma.transaction.update({
                where: {
                    id: list_transaction[i].id,
                },
                data: {
                    status: 'cancelled',
                },
            })
        }

        global.logger.info(`Schedule, set status transaction to cancel`)
    })

    global.logger.info(`Schedule job is running`)
}

module.exports = runSchedule
