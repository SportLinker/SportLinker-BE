const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const MatchJoinController = require('../controllers/matchJoin.controller')
const { authentication } = require('../middlewares/auth.middleware')
// join match

router.use(authentication)

router.post('/join', asyncHandler(MatchJoinController.joinMatch))
// get list user join match by match id
router.get('/:match_id', asyncHandler(MatchJoinController.getListUserJoinMatchByOwnerId))

// update status user_join in match
router.patch('/:match_id', asyncHandler(MatchJoinController.updateUserJoinMatchByMatchId))
// delete user join match or leave match
router.delete(
    '/:match_id',
    asyncHandler(MatchJoinController.deleteUserJoinMatchByMatchId)
)
module.exports = router
