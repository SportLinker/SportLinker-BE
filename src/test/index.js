const redis = require('../configs/redis.config').client
const prisma = require('../configs/prisma.config')
const { getPlaceDetail, getDistance } = require('../helpers/place.helper')

const getListUser = async () => {
    const listUser = await prisma.match.findMany()
    console.log(listUser)
    return listUser
}

const test = async () => {
    global.logger.info('Test log info')
    // await getDetailPlace({
    //     placeId: `ChIJa-nS17FrCzERjDFvhpcd85o`,
    // })
    // await getDistance({
    //     latOrigin: 21.028511,
    //     longOrigin: 105.804817,
    //     latDestination: 21.027763,
    //     longDestination: 105.83416,
    // })
    getListUser()
}

module.exports = {
    test,
}
