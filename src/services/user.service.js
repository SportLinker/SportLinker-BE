'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')
const bcrypt = require('bcryptjs')
const redis = require('../configs/redis.config').client

class UserService {
    async getAllUser(pageSize, pageNumber, name) {
        // convert to number of pageSize and pageNumber
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        const list_user = await prisma.user.findMany({
            where: {
                name: {
                    contains: name,
                },
            },
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
                    is_premium: 'desc',
                },
                {
                    createdAt: 'desc',
                },
            ],
        })
        // count total user
        const total_user = await prisma.user.count()
        // check total page
        const total_page = Math.ceil(total_user / pageSize)
        return {
            list_user,
            total_page,
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
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10)
        }
        // Create the user with the provided data
        const user = await prisma.user.create({
            data,
        })

        global.logger.info(
            `User created successfully by admin ${admin_id} with ID: ${user.id}`
        )

        return user
    }

    async updateUser(user_id, data, user_authen) {
        if (user_id !== user_authen.id) {
            if (user_authen.role !== 'admin') {
                throw new BadRequestError('Cannot update other user')
            }
        }
        // update
        const user = await prisma.user.update({
            where: {
                id: user_id,
            },
            data: {
                name: data.name,
                date_of_birth: data.date_of_birth,
                role: data.role,
                gender: data.gender,
                avatar_url: data.avatar_url,
                bio: data.bio,
            },
        })
        // update favorite
        if (data.favorite) {
            await redis.set(`favorite:${user_id}`, JSON.stringify(data.favorite))
        }
        // find favorite
        const favorite = await redis.get(`favorite:${user_id}`)
        user.favorite = favorite ? JSON.parse(favorite) : []
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

    async getUserById(user_id) {
        const user = await prisma.user.findUnique({
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                date_of_birth: true,
                role: true,
                status: true,
            },
            where: {
                id: user_id,
            },
        })
        // get favorite of user
        const favorite = await redis.get(`favorite:${user_id}`)
        user.favorite = favorite ? JSON.parse(favorite) : []

        return user
    }

    async getProfile(user_id) {
        const user = await prisma.user.findUnique({
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                date_of_birth: true,
                role: true,
                status: true,
                Wallet: {
                    select: {
                        balance: true,
                    },
                },
            },
            where: {
                id: user_id,
            },
        })
        // get favorite of user
        const favorite = await redis.get(`favorite:${user_id}`)
        user.favorite = favorite ? JSON.parse(favorite) : []

        return user
    }

    async getAllPlayer(userId) {
        const players = await prisma.user.findMany({
            select: {
                id: true,
                avatar_url: true,
                name: true,
                role: true,
                username: true,
            },
            where: {
                role: 'player',
                status: 'active',
                id: {
                    not: userId,
                },
            },
            orderBy: {
                name: 'asc',
            },
        })

        for (let i = 0; i < players.length; i++) {
            const favorite = await redis.get(`favorite:${players[i].id}`)
            players[i].favorite = favorite ? JSON.parse(favorite) : []
        }

        return players
    }

    premiumStrategies = {
        month: this.premiumMonth,
        year: this.premiumYear,
    }

    async createPremium(userId, type) {
        // check user is premium
        const userDetail = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                Wallet: true,
            },
        })
        if (userDetail.is_premium === true) {
            throw new BadRequestError('Bạn đã là thành viên premium')
        }

        return await this.premiumStrategies[type](userDetail)
    }

    async premiumMonth(user) {
        // get price pre month
        let price = global.config.get('PREMIUM_PRICE_PER_MONTH')
        price = parseInt(price)
        // check balance
        if (user.Wallet.balance < price) {
            throw new BadRequestError('Ví của bạn không đủ để thanh toán')
        }
        // update wallet
        await prisma.wallet.update({
            where: {
                user_id: user.id,
            },
            data: {
                balance: {
                    decrement: price,
                },
            },
        })
        // create premium
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                is_premium: true,
            },
        })
        // create transaction
        await prisma.transaction.create({
            data: {
                user_id: user.id,
                amount: price,
                method: 'wallet',
                type: 'premium',
                status: 'completed',
            },
        })

        // create log premium
        await prisma.premiumAccount.create({
            data: {
                user_id: user.id,
                type: 'month',
                expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        })

        const newUser = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
        })

        return newUser
    }

    async premiumYear(user) {
        // get price pre year
        let price = global.config.get('PREMIUM_PRICE_PER_YEAR')
        price = parseInt(price)
        // check balance
        if (user.Wallet.balance < price) {
            throw new BadRequestError('Ví của bạn không đủ để thanh toán')
        }
        // update wallet
        await prisma.wallet.update({
            where: {
                user_id: user.id,
            },
            data: {
                balance: {
                    decrement: price,
                },
            },
        })
        // create premium
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                is_premium: true,
            },
        })
        // create transaction
        await prisma.transaction.create({
            data: {
                user_id: user.id,
                amount: price,
                method: 'wallet',
                type: 'premium',
                status: 'completed',
            },
        })
        // create log premium
        await prisma.premiumAccount.create({
            data: {
                user_id: user.id,
                type: 'year',
                expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        })

        const newUser = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
        })

        return newUser
    }

    async getPremiumByUser(userId) {
        const premium = await prisma.premiumAccount.findMany({
            where: {
                user_id: userId,
            },
            orderBy: {
                created_at: 'desc',
            },
        })

        if (premium.length === 0) {
            return {
                status: 'inactive',
            }
        }

        return premium[0]
    }
}

module.exports = new UserService()
