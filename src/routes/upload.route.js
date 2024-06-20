const express = require('express')
const router = express.Router()
const { uploadDisk } = require('../configs/multer.config')
const { asyncHandler } = require('../helpers/asyncHandler.helper')

router.post('/', uploadDisk.single('file'))

router.get('/', (req, res) => {
    res.send('Upload success')
})

module.exports = router
