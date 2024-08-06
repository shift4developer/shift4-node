module.exports = class Customers {
  /**
     * @param {Communicator} communicator
     */
  constructor (communicator) {
    this.communicator = communicator
  }

  create (params, requestOptions) {
    return this.communicator.post('/customers', params, requestOptions)
  }

  get (customerId) {
    return this.communicator.get(`/customers/${customerId}`)
  }

  update (customerId, params, requestOptions) {
    return this.communicator.post(`/customers/${customerId}`, params, requestOptions)
  }

  delete (customerId) {
    return this.communicator.delete(`/customers/${customerId}`)
  }

  list (params) {
    return this.communicator.get('/customers', params)
  }
}
