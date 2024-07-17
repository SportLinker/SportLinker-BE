'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const BookingController = require('../controllers/booking.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.post('/', asyncHandler(BookingController.createBooking))

router.put('/:booking_id', asyncHandler(BookingController.updateBooking))

router.get('/getByUser', asyncHandler(BookingController.getAllBookingUser))

router.get('/getByAdmin', asyncHandler(BookingController.getAllBookingByAdmin))

router.delete('/:booking_id', asyncHandler(BookingController.deleteBooking))

module.exports = router
