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
                blog: {
                    status: 'approved',
                },
            },
            include: {
                blog: {
                    include: {
                        blog_link: true,
                        owner: true,
                    },
                },
            },
            orderBy: [
                {
                    is_read: 'asc',
                },
                {
                    created_at: 'desc',
                },
            ],
        })
        return blog_of_user
    }

    /**
     * @function getCommentList
     * @param {*} blogId
     * @logic
     * 1. Get comment list
     */

    async getCommentListByBlog(blogId) {
        // 1. Get comment list
        const comment_of_blog = await prisma.blogComment.findMany({
            where: {
                blog_id: blogId,
            },
            include: {
                user: true,
            },
        })

        return comment_of_blog
    }

    /**
     * @function reactBlog
     * @param {*} data, userId
     * @logic
     * 1. React blog
     */

    async reactBlog(data, userId) {
        // 1. React blog
        const react_blog = await prisma.blogReact.create({
            data: {
                blog_id: data.blog_id,
                user_id: userId,
            },
        })

        return react_blog
    }

    /**
     * @function removeReactBlog
     * @param {*} data, userId
     * @logic
     * 1. Remove react blog
     */

    async removeReactBlog(data, userId) {
        // 1. Remove react blog
        const react_blog = await prisma.blogReact.findFirst({
            where: {
                blog_id: data.blog_id,
                user_id: userId,
            },
        })

        await prisma.blogReact.delete({
            where: {
                id: react_blog.id,
            },
        })

        return `Remove react blog success`
    }

    /**
     * @function removeBlog
     * @param {*} blogId, userId
     * @logic
     * 1. Remove blog
     */

    async removeBlog(blogId, userId) {
        // 1. Remove blog
        await prisma.blog.update({
            where: {
                id: blogId,
            },
            data: {
                status: 'deleted',
            },
        })

        return `Remove blog success`
    }
}

module.exports = new BlogService()
