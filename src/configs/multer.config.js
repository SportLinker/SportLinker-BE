'use strict'

const multer = require('multer')
const path = require('path')

const uploadDisk = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public')
        },
        filename: function (req, file, cb) {
            cb(null, `${file.originalname}`)
        },
    }),
})

module.exports = {
    uploadDisk,
}
