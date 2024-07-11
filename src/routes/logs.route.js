'use strict'

const express = require('express')
const router = express.Router()
const fs = require('fs')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.get('/', (req, res) => {
    // return all logs in file
    let logs = fs.readFileSync('logs/2024/06/2024-06-26.log', 'utf8')
    logs = logs.split('\n')
    res.send(logs)
})

module.exports = router
