'use strict'

const prisma = require('../configs/prisma.config').client
const { getStringHourAndMinut } = require('../helpers/timestamp.helper')

class DashboardService {
    // Strategy pattern
    dashboardStrategies = {
        match: this.getListMatchDashBoard,
        blog: 'blog',
        transaction: 'transaction',
    }

    async getDashboardData(type, month, year) {
        console.log('type', type)
        month = parseInt(month)
        year = parseInt(year)
        return await this.dashboardStrategies[type](month, year)
    }

    async getListMatchDashBoard(month, year) {
        const matchs_by_this_time = await prisma.match.findMany({
            where: {
                start_time: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                },
            },
        })

        // get list match month before
        const matchs_by_last_month = await prisma.match.findMany({
            where: {
                start_time: {
                    gte: new Date(year, month - 2, 1),
                    lt: new Date(year, month - 1, 1),
                },
            },
        })

        // reduce by time
        let match_reduce_by_time = matchs_by_this_time.reduce((acc, match) => {
            const key = getStringHourAndMinut(match.start_time)
            console.log('key', key)
            if (!acc[key]) {
                acc[key] = {
                    time: key,
                    total_match: 0,
                }
            }
            acc[key].total_match++
            return acc
        }, {})
        // convert to array
        match_reduce_by_time = Object.values(match_reduce_by_time)
        // get total match
        const total_match_by_this_time = matchs_by_this_time.length
        const total_match_by_last_month = matchs_by_last_month.length
        // compare with last month to percent
        let compare_last_month
        if (total_match_by_last_month === 0) {
            compare_last_month = total_match_by_this_time
        } else {
            compare_last_month =
                ((total_match_by_this_time - total_match_by_last_month) /
                    total_match_by_last_month) *
                100
        }

        let result = {
            match_by_time: match_reduce_by_time,
            total_match: total_match_by_this_time,
            compare_last_month: compare_last_month,
        }
        return result
    }
}

module.exports = new DashboardService()
