const app = require('./src/app')
const http = require('http')
const server = http.createServer(app)
// connect socket
const io = require('socket.io')(server)

io.on('connection', (socket) => {
    console.log('Socket connected')
})

// Attach event listener for process exit
process.on('exit', () => global.mySQLConnection.disconnect())

// Attach event listener for process termination
process.on('SIGINT', () => {
    console.log('Process terminated')
    process.exit()
})

// Attach event listener for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception occurred:', err)
    process.exit(1)
})

server.listen(global.config.get('APP_PORT'), () => {
    global.logger.info(
        `Server is running on ${global.config.get('NODE_ENV')} mode`
    )
    global.logger.info(
        `Server is running on port ${global.config.get('APP_PORT')}`
    )
})
