const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const MessageController = require('../controllers/message.controller')

router.get(
    '/group_message_id',
    asyncHandler(MessageController.getListMessageByGroupMessageId)
)

module.exports = router
