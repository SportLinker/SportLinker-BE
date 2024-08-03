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
            // 1252932322697678900
            // test 1269271299142717565
            if (message.channelId === '1269271299142717565') {
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
                    /**
                     * 1. Condition user send by momo
                     */
                    if (transaction_code.includes('MB')) {
                        transaction_code = transaction_code.split(' ')[2].trim()
                        // make transacition_code to 6 characters E4RDDT-
                        transaction_code = transaction_code.slice(0, 6)
                        global.logger.info(
                            `Payment by condition user send by momo includes MB`,
                            transaction_code
                        )
                        await PaymentService.handleSuccessDepositPaymentBank(
                            transaction_code
                        )
                        return
                    }
                    /**
                     * 2. Condition user send by other bank
                     */
                    const hyphenCount = (transaction_code.match(/-/g) || []).length

                    if (hyphenCount > 1) {
                        transaction_code = transaction_code.split('-')[1].trim()
                        global.logger.info(
                            `Payment by condition user send by other bank`,
                            transaction_code
                        )
                        await PaymentService.handleSuccessDepositPaymentBank(
                            transaction_code
                        )
                        return
                    }
                    /**
                     * 3. Normal case
                     */

                    global.logger.info(
                        `Payment by condition normal case`,
                        transaction_code
                    )
                    await PaymentService.handleSuccessDepositPaymentBank(transaction_code)

                    return
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
