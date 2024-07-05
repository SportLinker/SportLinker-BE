'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')
const NotificationService = require('./notification.service')

class BookingService {
    async createBooking(data, userId) {
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
        return booking
    }

    async updateBooking(bookingId, data) {
        // update status booking
        const booking = await prisma.bookingYard.findUnique({
            select: {
                id: true,
                yard_id: true,
                time_start: true,
                user_id: true,
                yard: {
                    select: {
                        yard_name: true,
                    },
                },
            },
            where: {
                id: bookingId,
            },
        })
        // check status is pending
        if (booking.status !== 'pending') {
            throw new BadRequestError(
                'Không thể cập nhật trạng thái đặt sân đã được chấp nhận hoặc từ chối'
            )
        }
        // get user detail
        const user = await prisma.user.findUnique({
            where: {
                id: booking.user_id,
            },
        })
        // update booking same time to rejected
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
            // update booking
            await prisma.bookingYard.update({
                where: {
                    id: bookingId,
                },
                data: {
                    status: data.status,
                },
            })
            // send notification to user
            await NotificationService.createNotification({
                receiver_id: user.id,
                content: `Đặt sân ${booking.yard.yard_name} vào lúc ${booking.time_start} - ${booking.time_end} đã được chấp nhận`,
            })

            const update_yard_reject = await prisma.bookingYard.updateMany({
                where: {
                    yard_id: booking.yard_id,
                    time_start: booking.time_start,
                    status: 'pending',
                },
                data: {
                    status: 'rejected',
                },
            })
            // send notification to user
            for (let i = 0; i < update_yard_reject.count; i++) {
                await NotificationService.createNotification({
                    receiver_id: update_yard_reject[i].user_id,
                    content: `Đặt sân ${booking.yard.yard_name} vào lúc ${booking.time_start} - ${booking.time_end} đã bị từ chối`,
                })
            }
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
            // send notification
            await NotificationService.createNotification({
                receiver_id: user.id,
                content: `Đặt sân ${booking.yard.yard_name} vào lúc ${booking.time_start} - ${booking.time_end} đã bị từ chối`,
            })
        }

        return booking
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
}

module.exports = new BookingService()
