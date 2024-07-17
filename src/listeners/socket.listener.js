'use strict'

const io = global.io
const GroupMessageService = require('../services/groupMessage.service')
const MessageService = require('../services/message.service')
const prisma = require('../configs/prisma.config').client

const socketListener = () => {
    global.logger.info('Socket listener is running')

    global.onLineUser = new Map()
    io.on('connection', (socket) => {
        socket.on('online-user', async (userId) => {
            // set online user
            global.onLineUser.set(userId, socket.id)
            global.logger.info(`Online user: ${JSON.stringify(global.onLineUser)}`)
            // get list group message of user
            const listGroupMessage = await GroupMessageService.getListGroupMessageByUser(
                userId
            )
            // join room group message of user
            listGroupMessage.forEach((groupMessage) => {
                socket.join(groupMessage.group_message_id)
            })
        })

        /**
         * @param {*} data
         * @variable
         * 1 message_to === group_message_id
         * 2 message_from === user_id
         */

        socket.on('send-message', async (data) => {
            console.log(`send-message: ${JSON.stringify(data)}`)
            const { message_id, message_to, message_from, content, created_at } =
                data.message.payload
            // get list user id in group not include user send message
            const detail_message = await MessageService.createMessageBySocket(
                message_id,
                message_from,
                content,
                created_at
            )
            // send message to room
            io.to(message_to).emit('receive-message', detail_message)
        })

        // disconnect
        socket.on('disconnect', () => {
            global.logger.info(`User disconnected: ${socket.id}`)
        })
    })
}

module.exports = {
    socketListener,
}
