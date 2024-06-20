'use strict'

const { Client, GatewayIntentBits } = require('discord.js')
const PaymentService = require('../services/payment.service')

const discordListener = () => {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    })
    // chanel 1252932322697678900
    client.login(global.config.get(`DISCORD_TOKEN`))

    client.on

    client.on('messageCreate', async (message) => {
        if (message.channelId === '1252932322697678900') {
            let transaction_code = message.content.split('\n')[1]
            transaction_code = transaction_code.split(':')[1].trim()
            transaction_code = transaction_code.split(' ')[0].trim()
            // Call service
            if (transaction_code) {
                await PaymentService.handleSuccessDepositPaymentBank(transaction_code)
            }
        }
    })

    global.logger.info('Discord listener is running')
}

module.exports = {
    discordListener,
}
