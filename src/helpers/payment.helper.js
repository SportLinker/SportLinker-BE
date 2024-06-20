'use strict'

const bankQRLink = (amount, transaction_code) => {
    return `https://api.vietqr.io/image/970422-0825999871-kjt0tfL.jpg?accountName=HUYNH CHI BAO&amount=${amount}&addInfo=${transaction_code}`
}

module.exports = {
    bankQRLink,
}
