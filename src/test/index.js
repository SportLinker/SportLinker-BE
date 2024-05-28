const redis = require('../configs/redis.config').client
const prisma = require('../configs/prisma.config')

const getListUser = async () => {
    const listUser = await prisma.user.findMany()
    global.logger.info('List user:: ', JSON.stringify(listUser))
    return listUser
}

const test = async () => {
    global.logger.info('Test log info')
    await getListUser()
}

module.exports = {
    test,
}
