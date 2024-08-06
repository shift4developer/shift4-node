module.exports = class Cards {
  /**
     * @param {Communicator} communicator
     */
  constructor (communicator) {
    this.communicator = communicator
  }

  create (customerId, params, requestOptions) {
    return this.communicator.post(`/customers/${customerId}/cards`, params, requestOptions)
  }

  get (customerId, cardId) {
    return this.communicator.get(`/customers/${customerId}/cards/${cardId}`)
  }

  update (customerId, cardId, params, requestOptions) {
    return this.communicator.post(`/customers/${customerId}/cards/${cardId}`, params, requestOptions)
  }

  delete (customerId, cardId) {
    return this.communicator.delete(`/customers/${customerId}/cards/${cardId}`)
  }

  list (customerId, params) {
    return this.communicator.get(`/customers/${customerId}/cards`, params)
  }
}
