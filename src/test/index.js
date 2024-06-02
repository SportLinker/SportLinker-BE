const redis = require('../configs/redis.config').client
const prisma = require('../configs/prisma.config')
const { getPlaceDetail, getDistance } = require('../helpers/place.helper')

const getListUser = async () => {
    const listUser = await prisma.match.findMany().catch((err) => {
        console.log(err)
        return []
    })
    console.log(listUser)
}

const getFavorite = async () => {
    const favorite = await redis.get(`favorite:clwxu3soj000014ox8yfejzg3`)
    console.log(favorite)
}

const test = async () => {
    global.logger.info('Test log info is running')
    // await getPlaceDetail({
    //     placeId: `ChIJa-nS17FrCzERjDFvhpcd85o`,
    // })
    // await getDistance({
    //     latOrigin: 21.028511,
    //     longOrigin: 105.804817,
    //     latDestination: 21.027763,
    //     longDestination: 105.83416,
    // })
    await getListUser()
    await getFavorite()

    // time only include hours, minutes of now
}

module.exports = {
    test,
}
