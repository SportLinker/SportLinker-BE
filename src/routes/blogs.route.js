'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const BlogController = require('../controllers/blog.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.post('/', asyncHandler(BlogController.createNewBlog))

router.get('/', asyncHandler(BlogController.getBlogList))

router.get('/getMyBlog', asyncHandler(BlogController.getMyBlogList))

router.get('/comment/:blog_id', asyncHandler(BlogController.getCommentList))

router.get('/react/:blog_id', asyncHandler(BlogController.getReactList))

router.post('/comment/:blog_id', asyncHandler(BlogController.createComment))

router.delete('/comment/:comment_id', asyncHandler(BlogController.removeComment))

router.post('/react', asyncHandler(BlogController.reactBlog))

router.delete('/react/:blog_id', asyncHandler(BlogController.removeReactBlog))

router.delete('/:blog_id', asyncHandler(BlogController.removeBlog))

module.exports = router
