const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const UserController = require('../controllers/user.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.get('/', asyncHandler(UserController.getAllUser))

router.get('/getProfile', asyncHandler(UserController.getProfile))

router.get('/getAllPlayer', asyncHandler(UserController.getAllPlayer))

router.get('/:user_id', asyncHandler(UserController.getUserById))

router.post('/', asyncHandler(UserController.createUser))

router.put('/:user_id', asyncHandler(UserController.updateUser))

router.delete('/:user_id', asyncHandler(UserController.deleteUser))

module.exports = router
