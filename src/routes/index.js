const _ = require('lodash')
const fs = require('fs')
// const LoggerService = require('../services/logger.service')
// const log = new LoggerService(module.filename)
const router = require('express').Router()

// load all routers in this directory and assign router based on filename.router.js
fs.readdirSync(__dirname).forEach((file) => {
    if (file !== 'index.js') {
        const routerName = _.camelCase(file.split('.')[0])
        try {
            router.use(`/${routerName}`, require(`./${file}`))
        } catch (err) {

        }
    }
})

module.exports = router