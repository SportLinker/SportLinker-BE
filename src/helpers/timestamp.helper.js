const moment = require('moment')

const getTimeByFormat = (format) => {
    return moment().format(format)
}

const getUCLHourAndMinute = (time) => {
    return new Date(time).getUTCHours() + new Date(time).getUTCMinutes()
}

const getStringByDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })
}

const getStringHourAndMinut = (time) => {
    let hour = new Date(time).getHours()
    let minute = new Date(time).getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minute < 10) {
        minute = `0${minute}`
    }
    return `${hour}:${minute}`
}

module.exports = {
    getTimeByFormat,
    getUCLHourAndMinute,
    getStringHourAndMinut,
    getStringByDate,
}
