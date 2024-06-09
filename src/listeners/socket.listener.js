'use strict'

const io = global.io

const socketListener = () => {
    io.on('connection', (socket) => {
        console.log('a user connected')
        socket.on('get-list-message-room', (user_id) => {
            // console.log('get-list-message-room', user_id)
            // socket.join(user_id)
        })
    })
}

module.exports = socketListener
