module.exports = class Credits {
  /**
     * @param {Communicator} communicator
     */
  constructor (communicator) {
    this.communicator = communicator
  }

  create (params, requestOptions) {
    return this.communicator.post('/credits', params, requestOptions)
  }

  get (chargeId) {
    return this.communicator.get(`/credits/${chargeId}`)
  }

  update (chargeId, params, requestOptions) {
    return this.communicator.post(`/credits/${chargeId}`, params, requestOptions)
  }

  list (params) {
    return this.communicator.get('/credits', params)
  }
}
