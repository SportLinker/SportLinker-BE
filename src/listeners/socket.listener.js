'use strict'

const io = global.io
const GroupMessageService = require('../services/groupMessage.service')
const MessageService = require('../services/message.service')
const prisma = require('../configs/prisma.config').client

const socketListener = () => {
    global.logger.info('Socket listener is running')

    global.onLineUser = new Map()
    io.on('connection', (socket) => {
        global.logger.info(`A user connected with socket id: ${socket.id}`)

        socket.on('online-user', async (userId) => {
            // set online user
            global.onLineUser.set(userId, socket.id)
            console.log(global.onLineUser)
            // get list group message of user
            const listGroupMessage = await GroupMessageService.getListGroupMessageByUser(
                userId
            )
            // join room group message of user
            listGroupMessage.forEach((groupMessage) => {
                console.log(`join room: ${groupMessage.group_message_id}`)
                socket.join(groupMessage.group_message_id)
            })
        })

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
            console.log('A user disconnected')
        })
    })
}

module.exports = {
    socketListener,
}
