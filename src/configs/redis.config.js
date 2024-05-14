const { createClient } = require('redis')

class RedisConnection {
    constructor() {
        if (!RedisConnection.instance) {
            this.client = createClient({
                password: global.config.get(`REDIS_PASSWORD`),
                socket: {
                    host: global.config.get(`REDIS_HOST`),
                    port: global.config.get(`REDIS_PORT`),
                },
            })

            RedisConnection.instance = this
        }
        return RedisConnection.instance
    }

    async connect() {
        this.client.on('connect', () => {
            global.logger.info('Connected to Redis')
        })

        this.client.on('error', (err) => {
            global.logger.error(`Error connecting to Redis: ${err.message}`)
        })

        this.client.connect()
    }
}

module.exports = new RedisConnection()
