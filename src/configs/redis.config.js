const { createClient } = require('redis')
const LoggerService = require('../services/logger.service')

class RedisConnection {
    logger = new LoggerService({ className: 'RedisConnection' })

    constructor() {
        if (!RedisConnection.instance) {
            this.client = createClient({
                // host: global.config.get('REDIS_HOST'), // Host of the Redis server
                // port: global.config.get('REDIS_PORT'), // Port of the Redis server
                // password: global.config.get('REDIS_PASSWORD'), // Password for authentication
                socket: {
                    host: global.config.get('REDIS_HOST'),
                    port: global.config.get('REDIS_PORT'),
                },
            })
            RedisConnection.instance = this
        }
        return RedisConnection.instance
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

module.exports = new RedisConnection()
