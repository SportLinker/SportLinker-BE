const twillio = require('twilio')

class Twillio {
    constructor() {
        this.client = twillio(
            global.config.get('TWILIO_ACCOUNT_SID'),
            global.config.get('TWILIO_AUTH_TOKEN')
        )
    }

    async sendSMS(to, body) {
        try {
            await this.client.messages.create({
                from: global.config.get('TWILIO_PHONE_NUMBER'),
                to: global.config.get('TWILIO_TO_PHONE_NUMBER'),
                body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
            })
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = new Twillio()
