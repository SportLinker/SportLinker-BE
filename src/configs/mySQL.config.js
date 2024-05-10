const mysql = require('mysql2')

const pool = mysql.createPool({
    host: global.config.get('MYSQL_HOST'),
    port: global.config.get('MYSQL_PORT'),
    user: global.config.get('MYSQL_USER'),
    password: global.config.get('MYSQL_PASSWORD'),
    database: global.config.get('MYSQL_DATABASE'),
})

class MySQLConnection {
    constructor() {
        this.connect()
    }

    connect(type = 'mysql') {
        pool.getConnection((err, connection) => {
                if (err) {
                    global.logger.error('Error connecting to MySQL: ', err)
                }
                global.logger.info('Connected to MySQL successfully');
        })
    }

    static getInstance() {
        if (!MySQLConnection.instance) {
            MySQLConnection.instance = new MySQLConnection();
        }
        return MySQLConnection.instance;
    }
}

const instanceMySQL = MySQLConnection.getInstance();
module.exports = instanceMySQL;