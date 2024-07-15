'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const BlogController = require('../controllers/blog.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.post('/', asyncHandler(BlogController.createNewBlog))

router.get('/', asyncHandler(BlogController.getBlogList))

router.get('/comment/:blog_id', asyncHandler(BlogController.getCommentList))

router.post('/react', asyncHandler(BlogController.reactBlog))

router.delete('/react', asyncHandler(BlogController.removeReactBlog))

router.delete('/:blog_id', asyncHandler(BlogController.removeBlog))

module.exports = router
