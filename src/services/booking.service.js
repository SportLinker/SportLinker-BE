'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')

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
}

module.exports = new BookingService()
