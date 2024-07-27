const app = require('./src/app')
const http = require('node:http')
const server = http.createServer(app)
// connect socket
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
})

global.io = io

// listen socket
require('./src/listeners/socket.listener').socketListener()
// listen bot discord
require('./src/listeners/discord.listener').discordListener()

server.listen(global.config.get('APP_PORT'), () => {
    global.logger.info(`Server is running on ${global.config.get('NODE_ENV')} mode`)
    global.logger.info(
        `Server is running on ${global.config.get('APP_HOST')}:${global.config.get(
            'APP_PORT'
        )}`
    )
})
