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

require('./src/listeners/socket.listener')()

server.listen(global.config.get('APP_PORT'), () => {
    global.logger.info(`Server is running on ${global.config.get('NODE_ENV')} mode`)
    global.logger.info(
        `Server is running on ${global.config.get('APP_HOST')}:${global.config.get(
            'APP_PORT'
        )}`
    )
})
