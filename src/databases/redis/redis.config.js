const { createClient } = require('redis')
const Logger = require('../../loggers/logger.config')

class Redis {
    logger = new Logger({ className: 'Redis' })

    constructor() {
        if (!Redis.instance) {
            this.client = createClient({
                // host: global.config.get('REDIS_HOST'), // Host of the Redis server
                // port: global.config.get('REDIS_PORT'), // Port of the Redis server
                // password: global.config.get('REDIS_PASSWORD'), // Password for authentication
                socket: {
                    host: global.config.get('REDIS_HOST'),
                    port: global.config.get('REDIS_PORT'),
                },
            })
            Redis.instance = this
        }
        return Redis.instance
    }

    async connect() {
        this.client.on('connect', () => {
            this.logger.info('Connected to Redis')
        })

        this.client.on('error', (err) => {
            this.logger.error(`Error connecting to Redis: ${err.message}`)
        })

        try {
            await this.client.connect()
        } catch (err) {
            this.logger.error(`Failed to connect to Redis: ${err.message}`)
        }
    }
}

module.exports = new Redis()
