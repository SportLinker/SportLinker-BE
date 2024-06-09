const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const { authentication } = require('../middlewares/auth.middleware')
const MessageController = require('../controllers/message.controller')

router.use(authentication)

router.get(
    '/:group_message_id',
    asyncHandler(MessageController.getListMessageByGroupMessageId)
)

router.post('/:group_message_id', asyncHandler(MessageController.createMessage))

module.exports = router
