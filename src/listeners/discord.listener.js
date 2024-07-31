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

    client.on('messageCreate', async (message) => {
        try {
            if (message.channelId === '1252932322697678900') {
                let row_mess = message.content.split('\n')
                let price = row_mess[0]
                price = price.split(' ')[5].trim()
                if (price === 'giảm') {
                    let transaction_code = message.content.split('\n')[1]
                    transaction_code = transaction_code.split(':')[1].trim()
                    transaction_code = transaction_code.split(' ')[0].trim()
                    // Call service
                    if (transaction_code) {
                        await PaymentService.handleSuccessWithdrawPaymentBank(
                            transaction_code
                        )
                    } else {
                        return
                    }
                } else if (price === 'tăng') {
                    let transaction_code = message.content.split('\n')[1]
                    transaction_code = transaction_code.split(':')[1].trim()
                    transaction_code = transaction_code.split(' ')[0].trim()
                    // Call service
                    if (transaction_code) {
                        await PaymentService.handleSuccessDepositPaymentBank(
                            transaction_code
                        )
                    } else {
                        return
                    }
                } else {
                    return
                }
            } else {
                return
            }
        } catch (error) {
            global.logger.error(error.message)
        }
    })

    // disconnect
    client.on('disconnect', () => {
        global.logger.info('A user disconnected')
    })

    global.logger.info('Discord listener is running')
}

module.exports = {
    discordListener,
}
