'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')
const NotificationService = require('./notification.service')

class BookingService {
    /**
     * @function createBooking
     * @param {*} data
     * @param {*} userId
     * @returns
     */
    async createBooking(data, userId) {
        // find user detail include wallet
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                Wallet: true,
            },
        })
        // find yard detail
        const yard = await prisma.yard.findUnique({
            where: {
                yard_id: data.yard_id,
            },
        })
        // find stadium detail
        const stadium = await prisma.stadium.findUnique({
            where: {
                id: yard.stadium_id,
            },
        })
        // check wallet balannce
        const priceBooking = (yard.price_per_hour * 30) / 100
        if (user.Wallet.balance < priceBooking) {
            throw new BadRequestError('Số dư trong ví không đủ để đặt sân')
        }
        // 1. find booking at this time start of yard
        const is_booking_exist = await prisma.bookingYard.findFirst({
            where: {
                yard_id: data.yard_id,
                time_start: data.time_start,
                status: 'accepted',
            },
        })
        if (is_booking_exist) {
            throw new BadRequestError('Sân đã được đặt vào thời gian này')
        }
        // 2. create booking
        const booking = await prisma.bookingYard.create({
            data: {
                user_id: userId,
                yard_id: data.yard_id,
                time_start: data.time_start,
                time_end: data.time_end,
                status: 'pending',
            },
        })
        // update wallet
        await prisma.wallet.update({
            where: {
                user_id: userId,
            },
            data: {
                balance: user.Wallet.balance - priceBooking,
            },
        })
        // 3. create notification to stadium
        await NotificationService.createNotification({
            content: `Có người dùng muốn đặt sân ${yard.yard_name} vào lúc ${data.time_start} - ${data.time_end}`,
            receiver_id: stadium.stadium_owner_id,
        })
        return booking
    }

    /**
     *
     * @param {*} bookingId
     * @param {*} data
     * @logic
     * 1. find booking detail include yard
     * 2. check status is pending if not throw error
     * 3. get user booking detail
     * 4. get stadium detail
     * 5. get owner stadium detail
     * 6. check status
     * 7. if status is accepted
     * 8. check time_start of yard is booked
     * 9. update status booking
     * 10. price booking of user send to owner 15%
     * 11. update wallet for stadium
     * 12. send notification to user booking
     * 13. find all booking at this time start of yard
     * 14. send notification to user
     * 15. update status booking
     * 16. send back money to user
     * 17. if status is rejected
     * 18. update status booking
     * 19. send back money to user
     * 20. send notification
     * 21. logs
     */

    async updateBooking(bookingId, data) {
        // find booking detail include detail of yard
        const booking = await prisma.bookingYard.findUnique({
            include: {
                yard: true,
            },
            where: {
                id: bookingId,
            },
        })
        // check status is pending if not throw error
        if (booking.status !== 'pending') {
            throw new BadRequestError(
                'Không thể cập nhật trạng thái đặt sân đã được chấp nhận hoặc từ chối'
            )
        }
        // get user booking detail
        const user = await prisma.user.findUnique({
            where: {
                id: booking.user_id,
            },
            include: {
                Wallet: true,
            },
        })
        // get stadium detail
        const stadium = await prisma.stadium.findUnique({
            where: {
                id: booking.yard.stadium_id,
            },
        })
        // get owner stadium detail
        const owner = await prisma.user.findUnique({
            where: {
                id: stadium.stadium_owner_id,
            },
        })
        // check status
        if (data.status === 'accepted') {
            // check time_start of yard is booked
            const is_booking_exist = await prisma.bookingYard.findMany({
                where: {
                    yard_id: booking.yard_id,
                    time_start: booking.time_start,
                    status: 'accepted',
                },
            })
            if (is_booking_exist.length > 1) {
                throw new BadRequestError('Sân đã được đặt vào thời gian này')
            }
            // update status booking
            await prisma.bookingYard.update({
                where: {
                    id: bookingId,
                },
                data: {
                    status: data.status,
                },
            })
            // price booking of user send to owner 15%
            const priceBookingForOwner = (booking.yard.price_per_hour * 15) / 100
            // update wallet for stadium
            await prisma.wallet.update({
                where: {
                    user_id: owner.id,
                },
                data: {
                    balance: owner.Wallet.balance + priceBookingForOwner,
                },
            })
            // send notification to user booking
            await NotificationService.createNotification({
                receiver_id: user.id,
                content: `Đặt sân ${booking.yard.yard_name} vào lúc ${booking.time_start} - ${booking.time_end} đã được chấp nhận`,
            })
            // find all booking at this time start of yard
            const yard_reject = await prisma.bookingYard.findMany({
                where: {
                    yard_id: booking.yard_id,
                    time_start: booking.time_start,
                    status: 'pending',
                    id: {
                        not: bookingId,
                    },
                },
            })
            // send notification to user
            for (let i = 0; i < yard_reject.length; i++) {
                await NotificationService.createNotification({
                    receiver_id: yard_reject[i].user_id,
                    content: `Đặt sân ${booking.yard.yard_name} vào lúc ${booking.time_start} - ${booking.time_end} đã bị từ chối`,
                })
                // update status booking
                await prisma.bookingYard.update({
                    where: {
                        id: yard_reject[i].id,
                    },
                    data: {
                        status: 'rejected',
                    },
                })
                // send back money to user
                await prisma.wallet.update({
                    where: {
                        user_id: yard_reject[i].user_id,
                    },
                    data: {
                        balance:
                            yard_reject[i].user.Wallet.balance +
                            (booking.yard.price_per_hour * 30) / 100,
                    },
                })
            }
            // logs
            global.logger.info(`Booking ${bookingId} has been accepted by ${user.id}`)
            return `Booking ${bookingId} has been accepted`
        }
        // status is rejected
        if (data.status === 'rejected') {
            await prisma.bookingYard.update({
                where: {
                    id: bookingId,
                },
                data: {
                    status: data.status,
                },
            })
            // send back money to user
            await prisma.wallet.update({
                where: {
                    user_id: booking.user_id,
                },
                data: {
                    balance:
                        user.Wallet.balance + (booking.yard.price_per_hour * 30) / 100,
                },
            })
            // send notification
            await NotificationService.createNotification({
                receiver_id: user.id,
                content: `Đặt sân ${booking.yard.yard_name} vào lúc ${booking.time_start} - ${booking.time_end} đã bị từ chối`,
            })
            // logs
            global.logger.info(`Booking ${bookingId} has been rejected by ${user.id}`)

            return `Booking ${bookingId} has been rejected`
        }
        global.logger.info(`NO ACTION for booking ${bookingId}`)
        return `NO ACTION for booking ${bookingId}`
    }

    async getAllBookingUser(userId) {
        const bookings = await prisma.bookingYard
            .findMany({
                where: {
                    user_id: userId,
                },
                orderBy: [
                    {
                        created_at: 'desc',
                    },
                    {
                        status: 'asc',
                    },
                ],
                include: {
                    yard: {
                        include: {
                            stadium: {
                                select: {
                                    stadium_name: true,
                                },
                            },
                        },
                    },
                },
            })
            .catch((error) => {
                console.log(error)
            })
        return bookings
    }

    /**
     *
     * @param {*} bookingId
     * @logic
     * 1. find booking detail
     * 2. check status is accepted if not throw error
     * 3. send back money to user
     * 4. update status booking
     * 5. send notification
     * 6. return message
     * @returns
     */

    async deleteBooking(bookingId) {
        const booking = await prisma.bookingYard.findUnique({
            where: {
                id: bookingId,
            },
            include: {
                yard: true,
            },
        })
        if (booking.status === 'accepted') {
            throw new BadRequestError('Không thể xóa đặt sân đã được chấp nhận')
        }
        await prisma.bookingYard.delete({
            where: {
                id: bookingId,
            },
        })
        // get user booking detail
        const user = await prisma.user.findUnique({
            where: {
                id: booking.user_id,
            },
            include: {
                Wallet: true,
            },
        })
        // send back money to user
        await prisma.wallet.update({
            where: {
                user_id: booking.user_id,
            },
            data: {
                balance: user.Wallet.balance + (booking.yard.price_per_hour * 30) / 100,
            },
        })
        // notification
        await NotificationService.createNotification({
            receiver_id: booking.user_id,
            content: `Đặt sân ${booking.yard.yard_name} vào lúc ${booking.time_start} - ${booking.time_end} đã bị xóa`,
        })
        return `Delete booking ${bookingId} successfully`
    }

    async getAllBookingByAdmin(pageSize, pageNumber) {
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)

        const bookings = await prisma.bookingYard.findMany({
            orderBy: [
                {
                    created_at: 'desc',
                },
                {
                    status: 'asc',
                },
            ],
            include: {
                yard: {
                    include: {
                        stadium: {
                            select: {
                                stadium_name: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar_url: true,
                    },
                },
            },
            skip: pageSize * (pageNumber - 1),
            take: pageSize,
        })
        // check total_page
        const total_page = Math.ceil(bookings.length / pageSize)

        return {
            bookings: bookings,
            total_page: total_page,
        }
    }
}

module.exports = new BookingService()
