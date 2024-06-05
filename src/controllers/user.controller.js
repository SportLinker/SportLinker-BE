'use strict'

const UserService = require('../services/user.service')
const { Ok, CREATED } = require('../core/sucess.response')

class UserController {
    async getAllUser(req, res, next) {
        new CREATED({
            message: 'Get all user successfully',
            metadata: await UserService.getAllUser(
                req.query.page_size,
                req.query.page_number
            ),
        }).send(res)
    }

    async createUser(req, res, next) {
        new CREATED({
            message: 'Create user successfully',
            metadata: await UserService.createUser(req.body, req.user.id),
        }).send(res)
    }

    async updateUser(req, res, next) {
        new Ok({
            message: 'Update user successfully',
            metadata: await UserService.updateUser(
                req.params.user_id,
                req.body,
                req.user.id
            ),
        }).send(res)
    }

    async deleteUser(req, res, next) {
        new Ok({
            message: 'Delete user successfully',
            metadata: await UserService.deleteUser(req.params.user_id, req.user.id),
        }).send(res)
    }
}

module.exports = new UserController()
