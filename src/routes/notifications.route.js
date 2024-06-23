'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const NotificationController = require('../controllers/notification.controller')

router.get('/', asyncHandler(NotificationController.getListNotificationByUser))

module.exports = router
