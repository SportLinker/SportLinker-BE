'use strict'

const { CREATED, Ok, NO_CONTENT } = require('../core/sucess.response')
const MessageService = require('../services/message.service')

class MessageController {
    async getListMessageByGroupMessageId(req, res, next) {
        new Ok({
            message: 'Get list message by group message id successfully',
            metadata: await MessageService.getListMessageByGroupMessageId(
                req.params.group_message_id,
                req.user.id
            ),
        }).send(res)
    }
}

module.exports = new MessageController()
