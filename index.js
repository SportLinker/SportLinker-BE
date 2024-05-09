const app = require('./src/app');

app.listen(global.config.get('APP_PORT'), () => {
    global.logger.info(`Server is running on ${global.config.get('APP_PORT')}`)
    global.logger.info(`Server is running on port ${global.config.get('APP_PORT')}`);
})

module.exports = app;