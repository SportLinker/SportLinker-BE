const redis = require('../configs/redis.config').client

const getList = async () => {
    // const list = await redis.get('favorite:clwfc7ack0000fsgo24kjmno7')
    // // redis.DEL('favorite:clwfc7ack0000fsgo24kjmno7')
    // // redis.SET(
    // //     'favorite:clwfc7ack0000fsgo24kjmno7',
    // //     JSON.stringify(['Bóng đá', 'Cầu lông'])
    // // )
    // console.log(list)
}

module.exports = {
    getList,
}
