const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();

router.get('/', userController.getListUser);
router.post('/', userController.createUser);

module.exports = router