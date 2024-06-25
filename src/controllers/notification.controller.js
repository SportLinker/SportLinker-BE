'use strict'

const NotificationService = require('../services/notification.service')
const { Ok } = require('../core/sucess.response')

class NotificationController {
    async getListNotificationByUser(req, res, next) {
        new Ok({
            message: 'Create payment successfully',
            metadata: await NotificationService.getListNotificationByUser(req.user.id),
        }).send(res)
    }
}

module.exports = new NotificationController()
