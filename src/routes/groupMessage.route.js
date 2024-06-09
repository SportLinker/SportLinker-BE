const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const { authentication } = require('../middlewares/auth.middleware')
const groupMessageController = require('../controllers/groupMessage.controller')

router.use(authentication)

router.get('/', asyncHandler(groupMessageController.getListGroupMessageByUser))

module.exports = router
