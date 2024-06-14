'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')

class VoucherService {
    /**
     * @function createVoucher
     * @param {*} data
     * @param {*} to
     * @logic
     * 1. check if create voucher to all user
     */
    async createVoucher(data, to) {
        // Create voucher
        const is_code_exist = await prisma.voucher.findFirst({
            where: {
                voucher_code: data.voucher_code,
            },
        })
        if (is_code_exist) {
            throw new BadRequestError('Voucher code already exist')
        }
        const voucher = await prisma.voucher.create({
            data: {
                voucher_code: data.voucher_code,
                voucher_name: data.voucher_name,
                expired_at: data.expired_at,
                value: data.value,
            },
        })
        // 2. check if create voucher to all user
        if (to === 'all') {
            const list_player = await prisma.user.findMany({
                where: {
                    status: 'active',
                    role: 'player',
                },
            })
            // create voucher for all user
            for (let i = 0; i < list_player.length; i++) {
                await prisma.user_voucher.create({
                    data: {
                        user_id: list_player[i].id,
                        voucher_id: voucher.id,
                    },
                })
            }
            return voucher
        }
        // 3. create voucher for specific user
        await prisma.user_voucher.create({
            data: {
                user_id: to,
                voucher_id: voucher.id,
            },
        })
        return voucher
    }

    /**
     * @function getAllVoucher
     * @logic
     * 1. get all voucher
     * 2. return all voucher
     */

    async getAllVoucher() {
        const voucher = await prisma.voucher.findMany({
            orderBy: {
                created_at: 'desc',
            },
        })
        return voucher
    }

    /**
     * @function getAllVoucherUser
     * @param {*} user_id
     * @logic
     * 1. get all voucher user
     * 2. return all voucher user
     */

    async getAllVoucherUser(user_id) {
        const voucher = await prisma.voucherUser.findMany({
            where: {
                user_id: user_id,
                status: 'active',
            },
        })

        return voucher
    }
}

module.exports = new VoucherService()
