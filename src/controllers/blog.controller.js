'use strict'

const { Ok, CREATED } = require('../core/sucess.response')
const BlogService = require('../services/blog.service')

class BlogController {
    async createNewBlog(req, res, next) {
        new CREATED({
            message: 'Blog created successfully',
            metadata: await BlogService.createNewBlog(req.body),
        })
    }
}

module.exports = new BlogController()
