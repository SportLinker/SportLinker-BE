const app = require('./src/app')
const http = require('node:http')
const server = http.createServer(app)
const Logger = require('./src/loggers/logger.config')
const logger = new Logger({ app: 'system', className: 'index' })

server.listen(global.config.get('APP_PORT'), () => {
    logger.info(`Server is running on ${global.config.get('NODE_ENV')} mode`)
    logger.info(
        `Server is running on ${global.config.get('APP_HOST')}:${global.config.get(
            'APP_PORT'
        )}`
    )
})
