'use strict'

const prisma = require('../configs/prisma.config').client
const { getStringHourAndMinut } = require('../helpers/timestamp.helper')

class DashboardService {
    async getDashboardData(month, year) {
        month = parseInt(month)
        year = parseInt(year)

        return {
            matchs: await this.getListMatchDashBoard(month, year),
            users: await this.getListUserDashBoard(month, year),
            blogs: await this.getBlogDashBoard(month, year),
            bookings: await this.getBookingDashboard(month, year),
        }
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
        let compare_last_month = await this.compareLastMonth(
            total_match_by_this_time,
            total_match_by_last_month
        )

        let result = {
            match_by_time: match_reduce_by_time,
            total_match: total_match_by_this_time,
            compare_last_month: compare_last_month,
        }
        return result
    }

    async getListUserDashBoard(month, year) {
        // Get player
        const player_by_this_time = await prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                },
                role: 'player',
            },
        })

        // get list player month before
        const player_by_last_month = await prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(year, month - 2, 1),
                    lt: new Date(year, month - 1, 1),
                },
                role: 'player',
            },
        })

        // get total player
        const total_user_by_this_time = player_by_this_time
        const total_user_by_last_month = player_by_last_month
        // compare with last month to percent
        let compare_last_month = await this.compareLastMonth(
            total_user_by_this_time,
            total_user_by_last_month
        )

        let player = {
            total_player: total_user_by_this_time,
            compare_last_month: compare_last_month,
        }

        // get total stadium account
        const total_stadium_account_this_time = await prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                },
                role: 'stadium',
            },
        })

        // get total stadium account month before
        const total_stadium_account_last_month = await prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(year, month - 2, 1),
                    lt: new Date(year, month - 1, 1),
                },
                role: 'stadium',
            },
        })

        // compare with last month to percent
        let compare_last_month_stadium = await this.compareLastMonth(
            total_stadium_account_this_time,
            total_stadium_account_last_month
        )

        let stadiums = {
            total_stadium_account: total_stadium_account_this_time,
            compare_last_month: compare_last_month_stadium,
        }

        return {
            players: player,
            stadiums: stadiums,
        }
    }

    async getBlogDashBoard(month, year) {
        const blog_by_this_time = await prisma.blog.count({
            where: {
                created_at: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                },
            },
        })

        // get list blog month before
        const blog_by_last_month = await prisma.blog.count({
            where: {
                created_at: {
                    gte: new Date(year, month - 2, 1),
                    lt: new Date(year, month - 1, 1),
                },
            },
        })

        // get total blog
        const total_blog_by_this_time = blog_by_this_time
        const total_blog_by_last_month = blog_by_last_month
        // compare with last month to percent
        let compare_last_month = await this.compareLastMonth(
            total_blog_by_this_time,
            total_blog_by_last_month
        )

        let result = {
            total_blog: total_blog_by_this_time,
            compare_last_month: compare_last_month,
        }
        return result
    }

    async getBookingDashboard(month, year) {
        // get total booking by this time
        const total_booking_by_this_time = await prisma.bookingYard.findMany({
            where: {
                created_at: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                },
                status: 'accepted',
            },
            include: {
                yard: true,
            },
        })
        // get total booking by last month
        const total_booking_by_last_month = await prisma.bookingYard.findMany({
            where: {
                created_at: {
                    gte: new Date(year, month - 2, 1),
                    lt: new Date(year, month - 1, 1),
                },
                status: 'accepted',
            },
            include: {
                yard: true,
            },
        })
        // compare with last month to percent
        let compare_booking = await this.compareLastMonth(
            total_booking_by_this_time.length,
            total_booking_by_last_month.length
        )
        // get income
        const income_by_this_time = total_booking_by_this_time.reduce((acc, booking) => {
            const total_hour = (booking.time_end - booking.time_start) / 3600000
            acc += total_hour * booking.yard.price_per_hour * 0.15
            return acc
        }, 0)
        // get income by last month
        const income_by_last_month = total_booking_by_last_month.reduce(
            (acc, booking) => {
                const total_hour = (booking.time_end - booking.time_start) / 3600000
                acc += total_hour * booking.yard.price_per_hour * 0.15
                return acc
            },
            0
        )
        // compare with last month to percent
        let compare_income = await this.compareLastMonth(
            income_by_this_time,
            income_by_last_month
        )
        // get revenue
        // get income
        const revenue_this_time = total_booking_by_this_time.reduce((acc, booking) => {
            const total_hour = (booking.time_end - booking.time_start) / 3600000
            acc += total_hour * booking.yard.price_per_hour
            return acc
        }, 0)
        // get income by last month
        const revenue_last_month = total_booking_by_last_month.reduce((acc, booking) => {
            const total_hour = (booking.time_end - booking.time_start) / 3600000
            acc += total_hour * booking.yard.price_per_hour
            return acc
        }, 0)
        // compare with last month to percent
        let compare_revenue = await this.compareLastMonth(
            revenue_this_time,
            revenue_last_month
        )

        return {
            bookings: {
                total_booking: total_booking_by_this_time.length,
                compare_last_month: compare_booking,
            },
            incomes: {
                total_income: income_by_this_time,
                compare_last_month: compare_income,
            },
            revenues: {
                total_revenue: revenue_this_time,
                compare_last_month: compare_revenue,
            },
        }
    }

    async compareLastMonth(total_this_month, total_last_month) {
        if (total_last_month === 0) {
            return total_this_month
        } else {
            return ((total_this_month - total_last_month) / total_last_month) * 100
        }
    }
}

module.exports = new DashboardService()
