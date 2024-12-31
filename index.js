const app = require('./src/app')
const http = require('node:http')
const server = http.createServer(app)
const LoggerService = require('./src/services/logger.service')
const logger = new LoggerService({ app: 'system', className: 'index' })

server.listen(global.config.get('APP_PORT'), () => {
    logger.info(`Server is running on ${global.config.get('NODE_ENV')} mode`)
    logger.info(
        `Server is running on ${global.config.get('APP_HOST')}:${global.config.get(
            'APP_PORT'
        )}`
    )
})
