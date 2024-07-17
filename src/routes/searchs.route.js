'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const { authentication } = require('../middlewares/auth.middleware')
const SearchController = require('../controllers/search.controller')

router.use(authentication)

router.get('/', asyncHandler(SearchController.search))

module.exports = router
