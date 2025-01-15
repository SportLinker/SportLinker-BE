class Config {
    constructor() {
        this.enviroment = process.env.NODE_ENV || 'development'

        require('dotenv').config({
            path: `.env.${this.enviroment}`,
        })
    }

    get(key) {
        return process.env[key]
    }
}

module.exports = new Config()
