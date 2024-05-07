'use strict'
// count connect
const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECONDS = 5000;

const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections: ${numConnection}`);
}
// check overload connect
const checkOverload = () => {
    setInterval(() => {
        const numConnect = mongoose.connections.length;
        const numCors = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        // example maximum number of connection based on number cors 
        const maxConnect = numCors * 5;

        console.log(`Number of connections: ${numConnect}`);
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

        if (numConnect > maxConnect) {
            console.log(`Overload connection: ${numConnect} > ${maxConnect}`);
        }

    }, _SECONDS) // moditor every 5s
}

module.exports = {
    countConnect,
    checkOverload
}