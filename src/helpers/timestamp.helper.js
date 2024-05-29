const moment = require('moment')

const getTimeByFormat = (format) => {
    return moment().format(format)
}

const getUCLHourAndMinute = (time) => {
    return new Date(time).getUTCHours() + new Date(time).getUTCMinutes()
}

const getStringHourAndMinut = (time) => {
    return `${new Date(time).getHours().toString()}:${new Date(time)
        .getMinutes()
        .toString()}`
}

module.exports = {
    getTimeByFormat,
    getUCLHourAndMinute,
    getStringHourAndMinut,
}
