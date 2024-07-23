'use strict'

const UserService = require('../services/user.service')
const { Ok, CREATED } = require('../core/sucess.response')

class UserController {
    async getAllUser(req, res, next) {
        new Ok({
            message: 'Get all user successfully',
            metadata: await UserService.getAllUser(
                req.query.page_size,
                req.query.page_number,
                req.query.name
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
                req.user
            ),
        }).send(res)
    }

    async deleteUser(req, res, next) {
        new Ok({
            message: 'Delete user successfully',
            metadata: await UserService.deleteUser(req.params.user_id, req.user.id),
        }).send(res)
    }

    async getUserById(req, res, next) {
        new Ok({
            message: 'Get user by id successfully',
            metadata: await UserService.getUserById(req.params.user_id),
        }).send(res)
    }

    async getProfile(req, res, next) {
        new Ok({
            message: 'Get profile successfully',
            metadata: await UserService.getProfile(req.user.id),
        }).send(res)
    }

    async getAllPlayer(req, res, next) {
        new Ok({
            message: 'Get all player successfully',
            metadata: await UserService.getAllPlayer(req.user.id),
        }).send(res)
    }

    async createPremium(req, res, next) {
        new CREATED({
            message: 'Create premium successfully',
            metadata: await UserService.createPremium(req.user.id, req.query.type),
        }).send(res)
    }

    async getPremiumByUser(req, res, next) {
        new Ok({
            message: 'Get premium by user successfully',
            metadata: await UserService.getPremiumByUser(req.user.id),
        }).send(res)
    }
}

module.exports = new UserController()
