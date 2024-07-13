'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const BlogController = require('../controllers/blog.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.post('/', asyncHandler(BlogController.createNewBlog))

router.get('/', asyncHandler(BlogController.getBlogList))

module.exports = router
