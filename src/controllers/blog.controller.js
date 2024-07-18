'use strict'

const { Ok, CREATED } = require('../core/sucess.response')
const BlogService = require('../services/blog.service')

class BlogController {
    // Blog
    async createNewBlog(req, res, next) {
        new CREATED({
            message: 'Blog created successfully',
            metadata: await BlogService.createNewBlog(req.body, req.user.id),
        }).send(res)
    }

    async getBlogList(req, res, next) {
        new Ok({
            message: 'Blog list',
            metadata: await BlogService.getBlogListByUser(
                req.user.id,
                req.query.page_size,
                req.query.page_number
            ),
        }).send(res)
    }

    async removeBlog(req, res, next) {
        new Ok({
            message: 'Blog removed',
            metadata: await BlogService.removeBlog(req.params.blog_id, req.user.id),
        }).send(res)
    }
    // Comment
    async getCommentList(req, res, next) {
        new Ok({
            message: 'Comment list',
            metadata: await BlogService.getCommentListByBlog(req.params.blog_id),
        }).send(res)
    }

    async createComment(req, res, next) {
        new CREATED({
            message: 'Comment created',
            metadata: await BlogService.createComment(
                req.params.blog_id,
                req.body,
                req.user
            ),
        }).send(res)
    }

    async removeComment(req, res, next) {
        new Ok({
            message: 'Comment removed',
            metadata: await BlogService.removeComment(req.params.comment_id, req.user.id),
        }).send(res)
    }
    // React
    async reactBlog(req, res, next) {
        new Ok({
            message: 'React blog',
            metadata: await BlogService.reactBlog(req.body, req.user.id),
        }).send(res)
    }

    async removeReactBlog(req, res, next) {
        new Ok({
            message: 'Remove react blog',
            metadata: await BlogService.removeReactBlog(req.params.blog_id, req.user.id),
        }).send(res)
    }

    async getMyBlogList(req, res, next) {
        new Ok({
            message: 'My blog list',
            metadata: await BlogService.getMyBlogList(req.user.id),
        }).send(res)
    }
}

module.exports = new BlogController()
