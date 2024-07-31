'use strict'

const prisma = require('../configs/prisma.config').client
const { getStringHourAndMinut } = require('../helpers/timestamp.helper')

class DashboardService {
    async getDashboardData(month, year) {
        month = parseInt(month)
        year = parseInt(year)
        let [
            revenue_this_month,
            revenue_last_month,
            matches,
            users,
            blogs,
            bookings,
            premiums,
        ] = await Promise.all([
            this.getIncomeDashboard(month, year),
            this.getIncomeDashboard(month - 1, year),
            this.getListMatchDashBoard(month, year),
            this.getListUserDashBoard(month, year),
            this.getBlogDashBoard(month, year),
            this.getBookingDashboard(month, year),
            this.getPremiumDashboard(month, year),
        ])
        // compare revenue
        let [compare_revenue, compare_income] = await Promise.all([
            this.compareLastMonth(
                revenue_this_month.total_revenue,
                revenue_last_month.total_revenue
            ),
            this.compareLastMonth(
                revenue_this_month.total_income,
                revenue_last_month.total_income
            ),
        ])

        return {
            matches: matches,
            users: users,
            blogs: blogs,
            bookings: bookings,
            premiums: premiums,
            revenues: {
                revenue: {
                    total_revenue: revenue_this_month.total_revenue,
                    compare_last_month: compare_revenue,
                },
                income: {
                    total_income: revenue_this_month.total_income,
                    compare_last_month: compare_income,
                },
            },
        }
    }

    /**
     *
     * @param {*} month
     * @param {*} year
     * @function getListMatchDashBoard
     * @returns
     */

    async getListMatchDashBoard(month, year) {
        let [matchs_by_this_time, matchs_by_last_month] = await Promise.all([
            prisma.match.findMany({
                where: {
                    start_time: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1),
                    },
                },
                orderBy: {
                    start_time: 'asc',
                },
            }),
            prisma.match.findMany({
                where: {
                    start_time: {
                        gte: new Date(year, month - 2, 1),
                        lt: new Date(year, month - 1, 1),
                    },
                },
            }),
        ])

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

    /**
     *
     * @param {*} month
     * @param {*} year
     * @function getListUserDashBoard
     * @returns
     */

    async getListUserDashBoard(month, year) {
        // Get player
        const [
            player_by_this_time,
            player_by_last_month,
            total_stadium_account_this_time,
            total_stadium_account_last_month,
        ] = await Promise.all([
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1),
                    },
                    role: 'player',
                },
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(year, month - 2, 1),
                        lt: new Date(year, month - 1, 1),
                    },
                    role: 'player',
                },
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1),
                    },
                    role: 'stadium',
                },
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(year, month - 2, 1),
                        lt: new Date(year, month - 1, 1),
                    },
                    role: 'stadium',
                },
            }),
        ])
        // define data return
        const [compare_last_month, compare_last_month_stadium] = await Promise.all([
            this.compareLastMonth(player_by_this_time, player_by_last_month),
            this.compareLastMonth(
                total_stadium_account_this_time,
                total_stadium_account_last_month
            ),
        ])

        const player = {
            total_player: player_by_this_time,
            compare_last_month: compare_last_month,
        }

        const stadiums = {
            total_stadium_account: total_stadium_account_this_time,
            compare_last_month: compare_last_month_stadium,
        }

        return {
            players: player,
            stadiums: stadiums,
        }
    }

    /**
     *
     * @param {*} month
     * @param {*} year
     * @function getBlogDashBoard
     * @returns
     */

    async getBlogDashBoard(month, year) {
        let [blog_by_this_time, blog_by_last_month] = await Promise.all([
            prisma.blog.count({
                where: {
                    created_at: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1),
                    },
                },
            }),
            prisma.blog.count({
                where: {
                    created_at: {
                        gte: new Date(year, month - 2, 1),
                        lt: new Date(year, month - 1, 1),
                    },
                },
            }),
        ])

        // compare with last month to percent
        let compare_last_month = await this.compareLastMonth(
            blog_by_this_time,
            blog_by_last_month
        )

        let result = {
            total_blog: blog_by_this_time,
            compare_last_month: compare_last_month,
        }
        return result
    }

    /**
     *
     * @param {*} month
     * @param {*} year
     * @function getBookingDashboard
     * @returns
     */

    async getBookingDashboard(month, year) {
        // get total booking by this time
        const [total_booking_by_this_time, total_booking_by_last_month] =
            await Promise.all([
                // get total booking by this time
                prisma.bookingYard.findMany({
                    where: {
                        created_at: {
                            gte: new Date(year, month - 1, 1),
                            lt: new Date(year, month, 1),
                        },
                    },
                    include: {
                        yard: true,
                    },
                }),
                // get total booking by last month
                prisma.bookingYard.findMany({
                    where: {
                        created_at: {
                            gte: new Date(year, month - 2, 1),
                            lt: new Date(year, month - 1, 1),
                        },
                    },
                    include: {
                        yard: true,
                    },
                }),
            ])
        // compare with last month to percent
        let compare_booking = await this.compareLastMonth(
            total_booking_by_this_time.length,
            total_booking_by_last_month.length
        )
        // combine booking by day of week
        const booking_by_day_of_week = await this.combineByDayOfWeek(
            total_booking_by_this_time
        )
        // // get income
        // const income_by_this_time = total_booking_by_this_time.reduce((acc, booking) => {
        //     const total_hour = (booking.time_end - booking.time_start) / 3600000
        //     acc += total_hour * booking.yard.price_per_hour * 0.15
        //     return acc
        // }, 0)
        // // get income by last month
        // const income_by_last_month = total_booking_by_last_month.reduce(
        //     (acc, booking) => {
        //         const total_hour = (booking.time_end - booking.time_start) / 3600000
        //         acc += total_hour * booking.yard.price_per_hour * 0.15
        //         return acc
        //     },
        //     0
        // )
        // // compare with last month to percent
        // let compare_income = await this.compareLastMonth(
        //     income_by_this_time,
        //     income_by_last_month
        // )
        // // get revenue
        // // get income
        // const revenue_this_time = total_booking_by_this_time.reduce((acc, booking) => {
        //     const total_hour = (booking.time_end - booking.time_start) / 3600000
        //     acc += total_hour * booking.yard.price_per_hour
        //     return acc
        // }, 0)
        // // get income by last month
        // const revenue_last_month = total_booking_by_last_month.reduce((acc, booking) => {
        //     const total_hour = (booking.time_end - booking.time_start) / 3600000
        //     acc += total_hour * booking.yard.price_per_hour
        //     return acc
        // }, 0)
        // // compare with last month to percent
        // let compare_revenue = await this.compareLastMonth(
        //     revenue_this_time,
        //     revenue_last_month
        // )
        // combine booking by day of week

        return {
            bookings: {
                total_booking: total_booking_by_this_time.length,
                compare_last_month: compare_booking,
                booking_by_day_of_week: booking_by_day_of_week,
            },
            // incomes: {
            //     total_income: income_by_this_time,
            //     compare_last_month: compare_income,
            // },
            // revenues: {
            //     total_revenue: revenue_this_time,
            //     compare_last_month: compare_revenue,
            // },
        }
    }

    /**
     *
     * @param {*} month
     * @param {*} year
     * @function getPremiumDashboard
     * @returns
     */

    async getPremiumDashboard(month, year) {
        // get total premium by this time
        const [total_premium_by_this_time, total_premium_by_last_month] =
            await Promise.all([
                prisma.premiumAccount.findMany({
                    where: {
                        created_at: {
                            gte: new Date(year, month - 1, 1),
                            lt: new Date(year, month, 1),
                        },
                    },
                }),
                prisma.premiumAccount.findMany({
                    where: {
                        created_at: {
                            gte: new Date(year, month - 2, 1),
                            lt: new Date(year, month - 1, 1),
                        },
                    },
                }),
            ])
        // compare with last month to percent
        let compare_premium = await this.compareLastMonth(
            total_premium_by_this_time.length,
            total_premium_by_last_month.length
        )

        return {
            total_premium: total_premium_by_this_time.length,
            compare_last_month: compare_premium,
        }
    }

    async getIncomeDashboard(month, year) {
        // get total booking and premium by this month
        const [total_booking, total_premium] = await Promise.all([
            prisma.bookingYard.findMany({
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
            }),
            prisma.premiumAccount.findMany({
                where: {
                    created_at: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1),
                    },
                },
            }),
        ])
        // get total revenues of booking
        const total_revenues_booking = total_booking.reduce((acc, booking) => {
            const total_hour = (booking.time_end - booking.time_start) / 3600000
            acc += total_hour * booking.yard.price_per_hour * 0.3
            return acc
        }, 0)
        // total revenue of booking
        const total_income_booking = total_revenues_booking * 0.5

        // get total revenues of premium
        const total_revenues_premium = total_premium.reduce((acc, premium) => {
            if (premium.type === 'year') {
                // prase to int
                acc += parseInt(global.config.get(`PREMIUM_PRICE_PER_YEAR`))
            } else if (premium.type === 'month') {
                acc += parseInt(global.config.get(`PREMIUM_PRICE_PER_MONTH`))
            }
            return acc
        }, 0)

        return {
            total_revenue: total_revenues_booking + total_revenues_premium,
            total_income: total_income_booking + total_revenues_premium,
        }
    }

    async compareLastMonth(total_this_month, total_last_month) {
        let result = 0
        if (total_last_month === 0) {
            result = total_this_month
        } else {
            result = ((total_this_month - total_last_month) / total_last_month) * 100
        }
        // convert result to .2f
        result = result.toFixed(2)
        return result
    }

    async combineByDayOfWeek(data) {
        return data.reduce((acc, item) => {
            const day = new Date(item.time_start).getDay()
            if (!acc[day]) {
                acc[day] = {
                    day: day,
                    total: 0,
                }
            }
            acc[day].total++
            return acc
        }, [])
    }
}

module.exports = new DashboardService()
