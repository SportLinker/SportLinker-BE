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
        if (data.images) {
            for (let i = 0; i < data.images.length; i++) {
                await prisma.blogLink.create({
                    data: {
                        blog_id: newBlog.id,
                        url: data.images[i],
                        type: 'image',
                    },
                })
            }
        }
        // 3. Create video
        if (data.videos) {
            for (let i = 0; i < data.videos.length; i++) {
                await prisma.blogLink.create({
                    data: {
                        blog_id: newBlog.id,
                        url: data.videos[i],
                        type: 'video',
                    },
                })
            }
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
        for (let i = 0; i < list_user.length; i++) {
            await prisma.blogUser.create({
                data: {
                    blog_id: newBlog.id,
                    user_id: list_user[i].id,
                },
            })
        }
        return newBlog
    }

    /**
     * @function getBlogList
     * @param {*} userId
     * @logic
     * 1. Get blog list
     * 2. Get image or video of blog
     */

    async getBlogListByUser(userId) {
        // 1. Get blog list
        const blog_of_user = await prisma.blogUser.findMany({
            where: {
                user_id: userId,
            },
            include: {
                blog: {
                    include: {
                        blog_link: true,
                    },
                },
            },
        })
        return blog_of_user
    }
}

module.exports = new BlogService()
