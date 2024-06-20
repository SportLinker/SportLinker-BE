'use strict'

const VoucherService = require('../services/voucher.service')
const { CREATED, Ok } = require('../core/sucess.response')

class VoucherController {
    async createVoucher(req, res) {
        new CREATED({
            message: 'Yard created successfully.',
            metadata: await VoucherService.createVoucher(req.body, req.body.to),
        }).send(res)
    }

    async getAllVoucher(req, res) {
        new Ok({
            metadata: await VoucherService.getAllVoucher(),
        }).send(res)
    }

    async getAllVoucherUser(req, res) {
        new Ok({
            metadata: await VoucherService.getAllVoucherUser(req.user.id),
        }).send(res)
    }

    async deleteVoucher(req, res) {
        new Ok({
            metadata: await VoucherService.deleteVoucher(req.params.voucher_id),
        }).send(res)
    }
}

module.exports = new VoucherController()
