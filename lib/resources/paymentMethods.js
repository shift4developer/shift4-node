module.exports = class PaymentMethods {
  /**
   * @param {Communicator} communicator
   */
  constructor (communicator) {
    this.communicator = communicator
  }

  create (params, requestOptions) {
    return this.communicator.post('/payment-methods', params, requestOptions)
  }

  get (paymentMethodId) {
    return this.communicator.get(`/payment-methods/${paymentMethodId}`)
  }

  delete (paymentMethodId) {
    return this.communicator.delete(`/payment-methods/${paymentMethodId}`)
  }

  list (params) {
    return this.communicator.get('/payment-methods', params)
  }
}
