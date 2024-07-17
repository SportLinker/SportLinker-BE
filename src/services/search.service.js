'use strict'

const { BadRequestError } = require('../core/error.response')
const prisma = require('../configs/prisma.config').client

class SearchService {
    searchStrategy = {
        user: this.searchUser,
        match: this.searchMatch,
        stadium: this.searchStadium,
    }

    async search(pageSize, pageNumber, search, type) {
        return this.searchStrategy[type](pageSize, pageNumber, search)
    }
    // search user
    async searchUser(pageSize, pageNumber, search) {
        // parse page size and page number
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        // search user by search and type
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        phone: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
                status: 'active',
                role: 'player',
            },
            take: pageSize,
            skip: pageSize * (pageNumber - 1),
        })
        return users
    }

    // search match

    async searchMatch(pageSize, pageNumber, search) {
        // parse page size and page number
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        // search match by search and type
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
                status: 'upcomming',
            },
            take: pageSize,
            skip: pageSize * (pageNumber - 1),
        })
        return matches
    }
    // search stadium
    async searchStadium(pageSize, pageNumber, search) {
        // parse page size and page number
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        // search stadium by search and type
        const stadiums = await prisma.stadium.findMany({
            where: {
                stadium_name: {
                    contains: search,
                    mode: 'insensitive',
                },
                stadium_status: 'approved',
            },
            take: pageSize,
            skip: pageSize * (pageNumber - 1),
        })
        return stadiums
    }
}

module.exports = new SearchService()
