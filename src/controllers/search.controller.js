'use strict'

const { Ok } = require('../core/sucess.response')
const SearchService = require('../services/search.service')

class SearchController {
    async search(req, res, next) {
        new Ok({
            message: 'Search success',
            metadata: await SearchService.search(
                req.query.page_size,
                req.query.page_number,
                req.query.search,
                req.query.type
            ),
        }).send(res)
    }
}

module.exports = new SearchController()
