'use strict'

const payOS = require('@payos/node')

class PayOS {
    constructor() {
        if (!PayOS.instance) {
            this.payment = new payOS(
                global.config.get(`PAYOS_CLINET_ID`),
                global.config.get(`PAYOS_API_KEY`),
                global.config.get(`PAYOS_CHECKSUM_KEY`)
            )
            PayOS.instance = this
        }
        return PayOS.instance
    }
}

module.exports = new PayOS()
