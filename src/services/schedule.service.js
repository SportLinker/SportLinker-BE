const schedule = require('node-schedule')
const prisma = require('../configs/prisma.config').client

const listScheduleTime = {
    validTimeMatch: '30 * * * *',
}

const runSchedule = () => {
    // check list match is out of date
    schedule.scheduleJob(listScheduleTime.validTimeMatch, async () => {
        // get list match is running < date
        const list_match = await prisma.match.findMany({
            where: {
                start_time: {
                    lt: new Date(),
                },
                status: 'upcomming',
            },
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

    global.logger.info(`Schedule job is running`)
}

module.exports = runSchedule
