'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const BlogController = require('../controllers/blog.controller')

router.post('/', asyncHandler(BlogController.createNewBlog))

module.exports = router
