'use strict'

const io = global.io
const GroupMessageService = require('../services/groupMessage.service')

const socketListener = () => {
    io.on('connection', (socket) => {
        console.log('A new user connected')

        io.on('receive-list-message', (user_id) => {
            const list_message_of_user =
                GroupMessageService.getListGroupMessageByUser(user_id)

            io.emit('get-list-message', list_message_of_user)
        })
    })
}

module.exports = socketListener
