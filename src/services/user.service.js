'use strict'

const userModel = require("../models/user.model");
const { getListInfo } = require("../utils");

class UserService {
    static getListUser = async () => {
        try {
            const result = await userModel.find();
            return getListInfo({
                filed: ['name', 'email'],
                object: result
            });
        } catch (error) {
            global.logger.error("Service:: getListUser", error);
            throw error;
        }
    }

    static createUser = async (data) => {
        try {
            const result = await userModel.create(data);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserService;