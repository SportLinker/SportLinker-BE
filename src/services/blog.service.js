'use strict'

const prisma = require('../configs/prisma.config').client
const NotificationService = require('./notification.service')

class BlogService {
    /**
     * @function createNewBlog
     * @param {*} data, userId
     * @logic
     * 1. Create a new blog
     * 2. Create image or video of blog
     */

    async createNewBlog(data, user) {
        // 1. Create a new blog
        const newBlog = await prisma.blog.create({
            data: {
                blog_content: data.blog_content,
                blog_address: data.blog_address,
                blog_owner: user.id,
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

        global.logger.info(`User ${user.name} created a new blog`)

        return newBlog
    }

    /**
     * @function getBlogList
     * @param {*} userId
     * @logic
     * 1. Get blog list
     * 2. Get image or video of blog
     */

    async getBlogListByUser(userId, pageSize, pageNumber) {
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        // 1. Get blog list
        let blog_of_user = await prisma.blogUser.findMany({
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
                    is_read: 'desc',
                },
                {
                    created_at: 'desc',
                },
            ],
            take: pageSize,
            skip: (pageNumber - 1) * pageSize,
        })

        const total = await prisma.blogUser.count({
            where: {
                user_id: userId,
                blog: {
                    status: 'approved',
                },
            },
        })

        // check user react blog
        for (let i = 0; i < blog_of_user.length; i++) {
            const react_blog = await prisma.blogReact.findFirst({
                where: {
                    blog_id: blog_of_user[i].blog_id,
                    user_id: userId,
                },
            })
            if (react_blog) {
                blog_of_user[i].blog.is_react = true
            } else {
                blog_of_user[i].blog.is_react = false
            }
        }

        const total_page = Math.ceil(total / pageSize)

        // sort blog by premium of user
        blog_of_user.sort((a, b) => {
            if (a.blog.owner.is_premium && !b.blog.owner.is_premium) {
                return -1
            }
            if (!a.blog.owner.is_premium && b.blog.owner.is_premium) {
                return 1
            }
            return 0
        })

        return {
            list_blog: blog_of_user,
            total_page: total_page,
            page_number: pageNumber,
        }
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

    /**
     * @function getMyBlogList
     * @param {*} userId
     * @logic
     * 1. Get my blog list
     */

    async getMyBlogList(userId) {
        const my_blog = await prisma.blog.findMany({
            where: {
                blog_owner: userId,
            },
            include: {
                blog_link: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        })
        // check react blog
        for (let i = 0; i < my_blog.length; i++) {
            const react_blog = await prisma.blogReact.findFirst({
                where: {
                    blog_id: my_blog[i].id,
                    user_id: userId,
                },
            })
            if (react_blog) {
                my_blog[i].is_react = true
            } else {
                my_blog[i].is_react = false
            }
        }

        return my_blog
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
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar_url: true,
                    },
                },
            },
        })

        return comment_of_blog
    }

    /**
     * @function createComment
     * @param {*} blogId, data, userId
     * @logic
     * 1. Create comment
     * 2. Create notification
     * 3. Get user of blog
     **/

    async createComment(blogId, data, user) {
        // 1. Create comment
        const new_comment = await prisma.blogComment.create({
            data: {
                blog_id: blogId,
                user_id: user.id,
                content: data.content,
            },
        })

        // 2. Create notification
        const owner_of_blog = await prisma.blog.findFirst({
            where: {
                id: blogId,
            },
            include: {
                owner: true,
            },
        })

        await NotificationService.createNotification({
            content: `${user.name} commented trên blog của bạn `,
            receiver_id: owner_of_blog.owner.id,
        })

        return new_comment
    }

    /**
     * @function removeComment
     * @param {*} blogId, userId
     * @logic
     * 1. Remove comment
     *
     */

    async removeComment(commentId, userId) {
        // get detail comment
        const comment = await prisma.blogComment.findFirst({
            where: {
                id: commentId,
            },
            include: {
                blog: {
                    include: {
                        owner: true,
                    },
                },
                user: true,
            },
        })
        // check user is owner of comment
        if (comment.user.id !== userId) {
            throw new Error('Bạn không có quyền xóa comment này')
        }
        // remove comment
        await prisma.blogComment.delete({
            where: {
                id: commentId,
            },
        })
        // create noti
        await NotificationService.createNotification({
            content: `${comment.user.name} đã xóa comment trên blog của bạn`,
            receiver_id: comment.blog.owner.id,
        })

        return `Remove comment success`
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
        // update total react blog
        await prisma.blog.update({
            where: {
                id: data.blog_id,
            },
            data: {
                total_like: {
                    increment: 1,
                },
            },
        })
        // update is read blog user
        const blog_user = await prisma.blogUser.findFirst({
            where: {
                blog_id: data.blog_detail,
                user_id: userId,
            },
        })

        await prisma.blogUser.update({
            where: {
                id: blog_user.id,
            },
            data: {
                is_read: true,
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

    async removeReactBlog(blogId, userId) {
        // 1. Remove react blog
        const react_blog = await prisma.blogReact.findFirst({
            where: {
                blog_id: blogId,
                user_id: userId,
            },
        })

        await prisma.blogReact.delete({
            where: {
                id: react_blog.id,
            },
        })

        // update total react blog
        await prisma.blog.update({
            where: {
                id: blogId,
            },
            data: {
                total_like: {
                    decrement: 1,
                },
            },
        })

        return `Remove react blog success`
    }

    /**
     * @function getReactList
     * @param {*} blogId
     * @logic
     * 1. Get react list
     */

    async getReactList(blogId) {
        // 1. Get react list
        const react_list = await prisma.blogReact.findMany({
            where: {
                blog_id: blogId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar_url: true,
                    },
                },
            },
        })

        return react_list
    }

    /**
     * @function getBlogDetail
     * @param {*} blogId
     * @logic
     * 1. Get blog detail
     * 2. Get image or video of blog
     */

    async getBlogDetail(blogId, userId) {
        // 1. Get blog detail
        const blog_detail = await prisma.blog.findFirst({
            where: {
                id: blogId,
            },
            include: {
                blog_link: true,
                owner: true,
            },
        })
        // find react blog
        const react_blog = await prisma.blogReact.findFirst({
            where: {
                blog_id: blogId,
                user_id: userId,
            },
        })
        if (react_blog) {
            blog_detail.is_react = true
        } else {
            blog_detail.is_react = false
        }

        return blog_detail
    }
}

module.exports = new BlogService()
