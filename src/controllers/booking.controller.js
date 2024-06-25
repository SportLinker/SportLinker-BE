'use strict'

const { Ok, CREATED } = require('../core/sucess.response')

class BookingController {
    async createBooking(req, res, next) {
        new CREATED({
            message: 'Create booking successfully',
            metadata: await BookingService.createBooking(req.body, req.user.id),
        }).send(res)
    }
}

module.exports = new BookingController()
