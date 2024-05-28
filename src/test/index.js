const redis = require('../configs/redis.config').client
const prisma = require('../configs/prisma.config')

const getListUser = async () => {
    const listUser = await prisma.user.findMany()
    console.log('listUser::: ', listUser)
    return listUser
}

const test = async () => {
    console.log(`Test is running`)
    await getListUser()
}

module.exports = {
    test,
}
