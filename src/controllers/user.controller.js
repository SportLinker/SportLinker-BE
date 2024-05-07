'use strict'

const UserService = require("../services/user.service")

class UserController {
    getListUser = async (req, res) => {
        try {

            return res
                .status(200)
                .json({
                    status: 200,
                    data: await UserService.getListUser()
                })

        } catch (error) {
            return res
                .status(500)
                .json({
                    status: 500,
                    message: error.message
                })
        }
    }

    createUser = async (req, res) => {
        try {
            const data = await UserService.createUser(req.body);

            return res
                .status(200)
                .json({
                    status: 200,
                    data: data
                })

        } catch (error) {
            return res
                .status(500)
                .json({
                    status: 500,
                    message: error.message
                })
        }
    }
}

module.exports = new UserController();