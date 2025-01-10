const _ = require('lodash')
const fs = require('fs')
const LoggerService = require('../services/logger.service')
const logger = new LoggerService({ className: 'Router' })
const router = require('express').Router()

// load all routers in this directory and assign router based on filename.router.js
fs.readdirSync(__dirname).forEach((file) => {
    if (file !== 'index.js') {
        const routerName = _.camelCase(file.split('.')[0])
        try {
            router.use(`/${routerName}`, require(`./${file}`))
        } catch (err) {
            logger.error(`Error loading router: ${routerName}, error: ${err}`)
        }
    }
})

module.exports = router
