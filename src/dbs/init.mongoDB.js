'use strict';
// singleton
const mongoose = require('mongoose');

const connectDB = `mongodb://${global.config.db.host}:${global.config.db.port}/${global.config.db.name}`;

const { countConnect } = require('../helpers/checkConnect.helper');
class Database {
    constructor() {
        this.connect();
    }
    // connect
    connect(type = 'mongodb') {
        
        if (process.env.NODE_ENV === 'dev') {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true })
        }

        mongoose.connect(connectDB,
            {
                maxPoolSize: 50
            }
        )
            .then(_ => {
                console.log('Connect to database successfully', countConnect());
            })
            .catch(err => console.log(err));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;