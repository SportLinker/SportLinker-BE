const loggerAppConfig = {
    app: 'app',
    system: 'system',
}

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
    },
}

module.exports = {
    loggerAppConfig,
    customLevels,
}
