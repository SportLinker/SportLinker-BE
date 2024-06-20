const express = require('express')
const router = express.Router()
const { authentication } = require('../middlewares/auth.middleware')
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const DashboardController = require('../controllers/dashboard.controller')

router.get('/', asyncHandler(DashboardController.getDashboardData))

module.exports = router
