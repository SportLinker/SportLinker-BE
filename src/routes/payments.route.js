const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const PaymentController = require('../controllers/payment.controller')

router.post('/', asyncHandler(PaymentController.createNewSport))

module.exports = router
