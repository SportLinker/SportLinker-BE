require('dotenv').config();

const dev = {
    app: {
        port: process.env.APP_PORT,
        host: process.env.APP_HOST
    },
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME
    }
}

const product = {
    app: {
        port: process.env.APP_PORT,
        host: process.env.APP_HOST
    },
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME
    }
}

const config = { dev, product };


module.exports = config[process.env.NODE_ENV || 'dev'];

// const config = s