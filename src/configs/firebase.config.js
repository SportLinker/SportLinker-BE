const { initializeApp } = require('firebase/app')
const { getAuth } = require('firebase/auth')

class Firebase {
    constructor() {
        this.app = initializeApp({
            apiKey: 'AIzaSyD9Oq04pYE0o7G6xC1eEgy2Lrej34leBFo',
            authDomain: 'sport-linker.firebaseapp.com',
            projectId: 'sport-linker',
            storageBucket: 'sport-linker.appspot.com',
            messagingSenderId: '100415546852',
            appId: '1:100415546852:web:14398557491ebcdf1593f1',
            measurementId: 'G-ZKDLBDYFRV',
        })
        this.auth = getAuth(this.app)
    }
}

module.exports = new Firebase().auth
