'use strict'

const io = global.io

const socketListener = () => {
    io.on('connection', (socket) => {
        console.log('a user connected')
    })
}

module.exports = socketListener
