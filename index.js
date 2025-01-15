const app = require('./src/app')
const http = require('node:http')
const cluster = require('cluster')
const os = require('os') // To get the number of CPU cores
const server = http.createServer(app)
const Logger = require('./src/loggers/logger.config')
const { loggerAppConfig } = require('./src/utils/logger.util')
const logger = new Logger({ app: loggerAppConfig.system, className: 'index' })

// Check if this is the master process
if (cluster.isMaster) {
    const numCPUs = os.cpus().length // Get the number of CPU cores

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    // When a worker dies, log the event and restart the worker
    cluster.on('exit', (worker, code, signal) => {
        logger.error(`Worker ${worker.process.pid} died. Restarting...`)
        cluster.fork() // Restart worker
    })
} else {
    // Workers can share the same server port
    server.listen(global.config.get('APP_PORT'), () => {
        logger.info(
            `Worker ${process.pid} is running on ${global.config.get('NODE_ENV')} mode`
        )
        logger.info(
            `Server is running on ${global.config.get('APP_HOST')}:${global.config.get(
                'APP_PORT'
            )}`
        )
    })
}
