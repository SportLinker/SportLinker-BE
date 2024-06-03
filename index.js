const app = require('./src/app')
const http = require('http')
const server = http.createServer(app)
// connect socket
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
    },
})

global.io = io

io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('join_room', (room) => {
        socket.join(room)
        console.log(`User joined room: ${room}`)
    })

    socket.on('send_message', (data) => {
        console.log(data)
        io.in(data.room).emit('receive_message', data)
    })

    socket.on('disconnect', () => {
        console.log('Client disconnected')
    })
})

server.listen(global.config.get('APP_PORT'), () => {
    global.logger.info(`Server is running on ${global.config.get('NODE_ENV')} mode`)
    global.logger.info(
        `Server is running on ${global.config.get('APP_HOST')}:${global.config.get(
            'APP_PORT'
        )}`
    )
})
