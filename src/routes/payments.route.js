const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const PaymentController = require('../controllers/payment.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.post('/', asyncHandler(PaymentController.createPayment))

router.get('/:transaction_code', asyncHandler(PaymentController.getPaymentsDetail))

module.exports = router
