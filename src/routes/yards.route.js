'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const YardController = require('../controllers/yard.controller')

router.post('/:stadium_id', asyncHandler(YardController.createYard))

router.get('/:stadium_id', asyncHandler(YardController.getYards))

module.exports = router
