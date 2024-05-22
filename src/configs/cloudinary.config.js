const cloudinary = require('cloudinary').v2

class Cloudinary {
    constructor() {
        this.cloudinary = cloudinary.config({
            cloud_name: global.config.get('CLOUDINARY_CLOUD_NAME'),
            api_key: global.config.get('CLOUDINARY_API_KEY'),
            api_secret: global.config.get('CLOUDINARY_API_SECRET'),
        })
    }
}

module.exports = new Cloudinary().cloudinary
