const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const MatchJoinController = require('../controllers/matchJoin.controller')
const { authenticate } = require('../middlewares/auth.middleware')
// join match
router.post('/join', authenticate, asyncHandler(MatchJoinController.joinMatch))
// get list user join match by match id
// router.get(
//     '/:match_id',
//     authenticate,
//     asyncHandler(MatchJoinController.getListUserJoinMatch)
// )

// get list user waiting join match
// reject user join match
// accept user join match
// delete user join match

module.exports = router
