const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { message } = req.body
        global.io.emit('groupMessage', message)
        res.json({
            message: 'success',
        })
    })
)

module.exports = router
