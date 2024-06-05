const redis = require('../configs/redis.config').client
const prisma = require('../configs/prisma.config')
const { getPlaceDetail, getDistance } = require('../helpers/place.helper')
const cloudinary = require('../configs/cloudinary.config')
// const twilio = require('../configs/twillio.config')

const getListUser = async () => {
    const listUser = await prisma.user.findMany().catch((err) => {
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
    // const placeDetail = await getPlaceDetail({
    //     cid: '12022315892551549787',
    // })
    // console.log(placeDetail)
    // //save to redis
    // await redis.set(`stadium:12022315892551549787`, JSON.stringify(placeDetail))
}

module.exports = {
    test,
}
