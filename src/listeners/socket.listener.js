'use strict'

const io = global.io
const GroupMessageService = require('../services/groupMessage.service')

const socketListener = () => {
    global.onLineUser = new Map()
    io.on('connection', (socket) => {
        console.log('A user connected')

        // socket.on('online-user', (user_id) => {
        //     // set user_id and socket.id to global map
        //     global.onLineUser.set(user_id, socket.id)
        //     // emit get list group message by user
        //     GroupMessageService.getListGroupMessageByUser(user_id).then((data) => {
        //         socket.emit('list-group-message', data)
        //     })
        // })

        // socket.on('revive-message', (data) => {
        //     // emit revive message to user in group
        //     socket.roo
        // })

        // socket.
    })
}

module.exports = socketListener
