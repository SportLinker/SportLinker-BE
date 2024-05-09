const moment = require('moment');

const getTimeByFormat = (format) => {
    return moment().format(format);
}

module.exports = {
    getTimeByFormat
}