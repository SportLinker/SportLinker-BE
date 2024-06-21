'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const VoucherController = require('../controllers/voucher.controller')

router.get('/', asyncHandler(VoucherController.getAllVoucher))

router.post('/', asyncHandler(VoucherController.createVoucher))

router.delete('/:voucher_id', asyncHandler(VoucherController.deleteVoucher))

router.get('/getByUser', asyncHandler(VoucherController.getAllVoucherUser))

module.exports = router
