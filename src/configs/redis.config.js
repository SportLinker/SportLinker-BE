// const { createPool } = require('mysql2');
// const {createClient} = require('redis');
// const client = createPool({
//     password: global.config.get('REDIS_PASSWORD'),
//         host: global.config.get('REDIS_HOST'),
//         port: global.config.get('REDIS_PORT')
    
// })

// class RedisConnection {
//     constructor() {
//         this.connect()
//     }

//     async connect() {
//         client.on('connect', () => {
//             global.logger.info('Redis connected')
//         })

//         client.on('error', (error) => {
//             global.logger.error(error)
//         })
//     }

//     static getInstance() {
//         if (!RedisConnection.instance) {
//             RedisConnection.instance = new RedisConnection();
//         }
//         return RedisConnection.instance;
//     }
// }

// const instanceRedis = RedisConnection.getInstance();
// module.exports = instanceRedis;