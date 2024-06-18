const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const PaymentController = require('../controllers/payment.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.get('/:transaction_id', asyncHandler(PaymentController.getPayment))

router.use(authentication)

router.post('/', asyncHandler(PaymentController.createPayment))

module.exports = router
