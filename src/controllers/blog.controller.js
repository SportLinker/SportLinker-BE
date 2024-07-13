'use strict'

const { Ok, CREATED } = require('../core/sucess.response')
const BlogService = require('../services/blog.service')

class BlogController {
    async createNewBlog(req, res, next) {
        new CREATED({
            message: 'Blog created successfully',
            metadata: await BlogService.createNewBlog(req.body, req.user.id),
        }).send(res)
    }

    async getBlogList(req, res, next) {
        new Ok({
            message: 'Blog list',
            metadata: await BlogService.getBlogList(req.user.id),
        }).send(res)
    }
}

module.exports = new BlogController()
