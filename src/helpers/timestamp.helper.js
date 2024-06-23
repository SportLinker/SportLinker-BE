const moment = require('moment')

const getTimeByFormat = (format, time) => {
    return moment(time).format(format)
}

const getUCLHourAndMinute = (time) => {
    return new Date(time).getUTCHours() + new Date(time).getUTCMinutes()
}

const getStringByDate = (date) => {
    // vietnamese date format (ex: Thứ hai, 20 tháng 9, 2021)
    return new Date(date).toLocaleDateString('vi-VN', {
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

const getStringDay = (time) => {
    let day = new Date(time).getDate()
    let month = new Date(time).getMonth() + 1
    let year = new Date(time).getFullYear()
    if (day < 10) {
        day = `0${day}`
    }
    if (month < 10) {
        month = `0${month}`
    }
    return `${year}-${month}-${day}`
}

module.exports = {
    getTimeByFormat,
    getUCLHourAndMinute,
    getStringHourAndMinut,
    getStringByDate,
    getStringDay,
}
