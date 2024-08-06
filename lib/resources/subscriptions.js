module.exports = class Subscriptions {
  /**
     * @param {Communicator} communicator
     */
  constructor (communicator) {
    this.communicator = communicator
  }

  create (params, requestOptions) {
    return this.communicator.post('/subscriptions', params, requestOptions)
  }

  get (subscriptionId) {
    return this.communicator.get(`/subscriptions/${subscriptionId}`)
  }

  update (subscriptionId, params, requestOptions) {
    return this.communicator.post(`/subscriptions/${subscriptionId}`, params, requestOptions)
  }

  cancel (subscriptionId) {
    return this.communicator.delete(`/subscriptions/${subscriptionId}`)
  }

  list (params) {
    return this.communicator.get('/subscriptions', params)
  }
}
