'use strict'

const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')
const brycpt = require('bcrypt')

class UserService {
    async getAllUser(pageSize, pageNumber) {
        // convert to number of pageSize and pageNumber
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        const list_user = await prisma.user.findMany({
            skip: pageSize * (pageNumber - 1),
            take: pageSize,
            orderBy: [
                {
                    status: 'asc',
                },
                {
                    role: 'asc',
                },
                {
                    createdAt: 'desc',
                },
            ],
        })
        // count total user
        const total_user = await prisma.user.count()
        return {
            list_user,
            total_user,
        }
    }

    async createUser(data, admin_id) {
        // check user is exist
        if (data.email) {
            const isExistMail = await prisma.user.findUnique({
                where: {
                    email: data.email,
                },
            })
            if (isExistMail) throw new BadRequestError('User is already exist')
        }
        // check phone is exist
        if (data.phone) {
            const isExistPhone = await prisma.user.findUnique({
                where: {
                    phone: data.phone,
                },
            })
            if (isExistPhone) throw new BadRequestError('Phone is already exist')
        }
        // hash password
        data.password = await brycpt.hash(data.password, 10)

        const user = await prisma.user.create({
            data,
        })
        global.logger.info(
            `Create user successfully by admin ${admin_id} with id: ${user.id}`
        )
        return user
    }

    async updateUser(user_id, data, admin_id) {
        const user = await prisma.user.update({
            where: {
                id: user_id,
            },
            data,
        })
        global.logger.info(
            `Update user successfully by admin ${admin_id} with id: ${user.id}`
        )
        return user
    }

    async deleteUser(user_id, admin_id) {
        // check user is admin
        const user = await prisma.user.findUnique({
            where: {
                id: user_id,
            },
        })
        if (user.role === 'admin') {
            throw new BadRequestError('Cannot delete admin user')
        }
        // delete user
        await prisma.user.update({
            where: {
                id: user_id,
            },
            data: {
                status: 'inactive',
            },
        })
        global.logger.info(
            `Delete user successfully by admin ${admin_id} with id: ${user.id}`
        )
        return user
    }
}

module.exports = new UserService()
