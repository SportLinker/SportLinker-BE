const _ = require('lodash');

const getInfo = ({ filed = [], object = {} }) => {
    return _.pick(object, filed);
}

const getListInfo = ({ filed = [], object = [] }) => {
    return object.map(item => _.pick(item, filed));
}

module.exports = {
    getInfo,
    getListInfo
}