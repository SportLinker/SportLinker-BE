const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const matchController = require('../controllers/match.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.get('/getMatchByUser', asyncHandler(matchController.getMatchByUser))

router.get('/admin/getAllMatch', asyncHandler(matchController.getAllMatchByAdmin))

router.get('/', asyncHandler(matchController.getListMatch))

router.get('/:match_id', asyncHandler(matchController.getMatchDetail))

router.put('/:match_id', asyncHandler(matchController.updateMatch))

router.post('/', asyncHandler(matchController.createNewMatch))

router.delete('/:match_id', asyncHandler(matchController.deleteMatch))

module.exports = router
