'use strict'

const io = global.io
const GroupMessageService = require('../services/groupMessage.service')

const socketListener = () => {
    global.logger.info('Socket listener is running')

    global.onLineUser = new Map()
    io.on('connection', (socket) => {
        console.log('A user connected')

        socket.on('online-user', async (userId) => {
            // set online user
            global.onLineUser.set(userId, socket.id)
            console.log(global.onLineUser)
            const list_group_message =
                await GroupMessageService.getListGroupMessageByUser(userId)
            // join room
            list_group_message.forEach((group) => {
                socket.join(group.group_message_id)
            })
        })

        socket.on('send-message', async (data) => {
            const { group_message_id, message, user_id } = data
            const group_message = await GroupMessageService.getGroupMessageById(
                group_message_id
            )
            if (!group_message) {
                return
            }
            const newMessage = await GroupMessageService.createMessage(
                group_message_id,
                user_id,
                message
            )
            io.to(group_message_id).emit('new-message', newMessage)
        })
    })
}

module.exports = {
    socketListener,
}
