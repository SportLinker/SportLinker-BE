'use strict'

const bankQRLink = (amount, transaction_code) => {
    return `https://api.vietqr.io/image/970422-0825999871-kjt0tfL.jpg?accountName=HUYNH CHI BAO&amount=${amount}&addInfo=${transaction_code}`
}

const createQRCodeForAdmin = ({
    amount,
    bank_account,
    bank_name,
    bank_bin,
    transaction_code,
}) => {
    const api = `https://api.vietqr.io/v2/generate`
    const header = {
        'Content-Type': 'application/json',
        'x-client-id': `${global.config.get(`VIETQR_CLIENT_ID`)}`,
        'x-api-key': `${global.config.get(`VIETQR_API_KEY`)}`,
    }
    const body = {
        accountNo: bank_account,
        accountName: 'QUY VAC XIN PHONG CHONG COVID',
        acqId: bank_bin,
        addInfo: transaction_code,
        amount: amount,
        template: 'compact',
    }
}

module.exports = {
    bankQRLink,
    createQRCodeForAdmin,
}
