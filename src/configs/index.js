require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`,
})
class Config {
    get(key) {
        return process.env[key]
    }
}

module.exports = new Config()
