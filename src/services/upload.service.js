'use strict'
const cloudinary = require('../configs/cloudinary.config')
const { BadRequestError } = require('../core/error.response')

class UserService {
    async getImageURL(folder) {
        const result = await cloudinary.sign_url(folder)
        return result
    }
}

module.exports = new UserService()
