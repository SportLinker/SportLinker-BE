'use strict'

const io = global.io
const GroupMessageService = require('../services/groupMessage.service')

const socketListener = () => {
    global.onLineUser = new Map()
    io.on('connection', (socket) => {
        console.log('A user connected')

        socket.on('online-user', (user_id) => {
            global.onLineUser.set(user_id, socket.id)
            console.log(global.onLineUser)
        })

        // socket.
    })
}

module.exports = socketListener
