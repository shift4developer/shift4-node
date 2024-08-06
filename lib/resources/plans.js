module.exports = class Plans {
  /**
     * @param {Communicator} communicator
     */
  constructor (communicator) {
    this.communicator = communicator
  }

  create (params, requestOptions) {
    return this.communicator.post('/plans', params, requestOptions)
  }

  get (planId) {
    return this.communicator.get(`/plans/${planId}`)
  }

  update (planId, params, requestOptions) {
    return this.communicator.post(`/plans/${planId}`, params, requestOptions)
  }

  delete (planId) {
    return this.communicator.delete(`/plans/${planId}`)
  }

  list (params) {
    return this.communicator.get('/plans', params)
  }
}
