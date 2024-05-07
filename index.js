const app = require('./src/app');

app.listen(global.config.app.port, () => {
    global.logger.info(`Server is running on ${process.env.NODE_ENV}`)
    global.logger.info(`Server is running on port ${global.config.app.port}`);
})

module.exports = app;