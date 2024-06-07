'use strict'
const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')
const bcrypt = require('bcrypt')

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
        // Check if the 'name' field is provided in the data
        if (!data.name) {
            throw new BadRequestError('Name is required')
        }

        // Check if the user with the provided email already exists
        if (data.email) {
            const isExistMail = await prisma.user.findUnique({
                where: {
                    email: data.email,
                },
            })
            if (isExistMail) {
                throw new BadRequestError('User with this email already exists')
            }
        }

        // Check if the user with the provided phone number already exists
        if (data.phone) {
            const isExistPhone = await prisma.user.findUnique({
                where: {
                    phone: data.phone,
                },
            })
            if (isExistPhone) {
                throw new BadRequestError('User with this phone number already exists')
            }
        }

        // Hash the password
        data.password = await bcrypt.hash(data.password, 10)

        // Create the user with the provided data
        const user = await prisma.user.create({
            data,
        })

        global.logger.info(
            `User created successfully by admin ${admin_id} with ID: ${user.id}`
        )

        return user
    }

    async updateUser(user_id, data, admin_id) {
        const validFields = {
            name: data.name, // Update the user's name
            email: data.email, // Update the user's email
            role: data.role,
            gender: data.gender,
            password: data.password, // Update the user's role
            date_of_birth: data.date_of_birth, // Update the user's date of birth
            status: data.status,
            // Add other valid fields for updating the user
        }

        const user = await prisma.user.update({
            where: {
                id: user_id,
            },
            data: validFields, // Only pass valid fields to the update function
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
