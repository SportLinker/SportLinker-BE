'use strict'

const prisma = require('../configs/prisma.config').client

class BlogService {
    /**
     * @function createNewBlog
     * @param {*} data, userId
     * @logic
     * 1. Create a new blog
     * 2. Create image or video of blog
     */

    async createNewBlog(data, userId) {
        // 1. Create a new blog
        const newBlog = await prisma.blog.create({
            data: {
                blog_content: data.blog_content,
                blog_address: data.blog_address,
                blog_owner: userId,
                blog_sport: data.blog_sport,
            },
        })
        // 2. Create image
        for (const image of data.images) {
            await prisma.blogLink.create({
                data: {
                    blog_id: newBlog.id,
                    url: image,
                    type: 'image',
                },
            })
        }
        // 3. Create video
        for (const video of data.videos) {
            await prisma.blogLink.create({
                data: {
                    blog_id: newBlog.id,
                    url: video,
                    type: 'video',
                },
            })
        }
        // 4. Create new Blog for user
        const list_user = await prisma.user.findMany({
            where: {
                status: 'active',
                role: {
                    in: ['coach', 'player', 'stadium'],
                },
            },
        })
        for (const user of list_user) {
            await prisma.blogUser.create({
                data: {
                    blog_id: newBlog.id,
                    user_id: user.id,
                },
            })
        }
        return newBlog
    }
}

module.exports = new BlogService()
