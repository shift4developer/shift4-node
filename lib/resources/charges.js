module.exports = class Charges {
  /**
     * @param {Communicator} communicator
     */
  constructor (communicator) {
    this.communicator = communicator
  }

  create (params, requestOptions) {
    return this.communicator.post('/charges', params, requestOptions)
  }

  get (chargeId) {
    return this.communicator.get(`/charges/${chargeId}`)
  }

  update (chargeId, params, requestOptions) {
    return this.communicator.post(`/charges/${chargeId}`, params, requestOptions)
  }

  capture (chargeId, params, requestOptions) {
    return this.communicator.post(`/charges/${chargeId}/capture`, params, requestOptions)
  }

  refund (chargeId, params, requestOptions) {
    return this.communicator.post(`/charges/${chargeId}/refund`, params, requestOptions)
  }

  list (params) {
    return this.communicator.get('/charges', params)
  }
}
