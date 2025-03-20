const Communicator = require('./communicator')

const Blacklist = require('./resources/blacklist')
const Cards = require('./resources/cards')
const Charges = require('./resources/charges')
const CheckoutRequest = require('./resources/checkoutRequest')
const Credits = require('./resources/credits')
const Customers = require('./resources/customers')
const Events = require('./resources/events')
const FileUploads = require('./resources/fileUploads')
const FraudWarnings = require('./resources/fraudWarnings')
const Plans = require('./resources/plans')
const Subscriptions = require('./resources/subscriptions')
const Tokens = require('./resources/tokens')
const Disputes = require('./resources/disputes')
const PaymentMethods = require('./resources/paymentMethods')

class Shift4Gateway {
  constructor (options) {
    if (typeof options == 'string') {
      options = { secretKey: options }
    }

    const { apiUrl, uploadsUrl, secretKey, merchantId } = { ...Shift4Gateway.defaultOptions, ...options }
    if (!secretKey) throw new Error('secretKey is required')
    if (!apiUrl) throw new Error('apiUrl is required')
    if (!uploadsUrl) throw new Error('fileUploadsUrl is required')

    const apiCommunicator = new Communicator({ secretKey, url: apiUrl, merchantId: merchantId })
    const fileUploadsCommunicator = new Communicator({ secretKey, url: uploadsUrl })

    this.blacklist = new Blacklist(apiCommunicator)
    this.cards = new Cards(apiCommunicator)
    this.charges = new Charges(apiCommunicator)
    this.checkoutRequest = new CheckoutRequest(secretKey)
    this.credits = new Credits(apiCommunicator)
    this.disputes = new Disputes(apiCommunicator)
    this.customers = new Customers(apiCommunicator)
    this.events = new Events(apiCommunicator)
    this.fileUploads = new FileUploads(fileUploadsCommunicator)
    this.fraudWarnings = new FraudWarnings(apiCommunicator)
    this.plans = new Plans(apiCommunicator)
    this.subscriptions = new Subscriptions(apiCommunicator)
    this.tokens = new Tokens(apiCommunicator)
    this.paymentMethods = new PaymentMethods(apiCommunicator)
  }
}

Shift4Gateway.defaultOptions = {
  apiUrl: 'https://api.shift4.com',
  uploadsUrl: 'https://uploads.api.shift4.com'
}

module.exports = (...opts) => new Shift4Gateway(...opts)
module.exports.Shift4Gateway = Shift4Gateway
module.exports.defaultOptions = Shift4Gateway.defaultOptions
