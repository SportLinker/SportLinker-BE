'use strict'

const DashboardService = require('../services/dashboard.service')
const { Ok } = require('../core/sucess.response')

class DashboardController {
    async getDashboardData(req, res, next) {
        new Ok({
            message: 'Get dashboard data successfully',
            metadata: await DashboardService.getDashboardData(
                req.query.type,
                req.query.month,
                req.query.year
            ),
        }).send(res)
    }
}

module.exports = new DashboardController()
