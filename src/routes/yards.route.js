'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const YardController = require('../controllers/yard.controller')

router.post('/:stadium_id', asyncHandler(YardController.createYard))

router.get('/:stadium_id', asyncHandler(YardController.getYards))

router.put('/:yard_id', asyncHandler(YardController.updateYard))

router.delete('/:yard_id', asyncHandler(YardController.deleteYard))

module.exports = router
