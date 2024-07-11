'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const TransactionController = require('../controllers/transaction.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.get('/getByUser', asyncHandler(TransactionController.getTransactionByUser))

router.get('/', asyncHandler(TransactionController.getAllTransaction))

router.put('/:transaction_id', asyncHandler(TransactionController.updateTransaction))

module.exports = router
