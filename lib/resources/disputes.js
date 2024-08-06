module.exports = class Disputes {
  /**
     * @param {Communicator} communicator
     */
  constructor (communicator) {
    this.communicator = communicator
  }

  get (disputeId) {
    return this.communicator.get(`/disputes/${disputeId}`)
  }

  update (disputeId, params, requestOptions) {
    return this.communicator.post(`/disputes/${disputeId}`, params, requestOptions)
  }

  close (disputeId, requestOptions) {
    return this.communicator.post(`/disputes/${disputeId}/close`, requestOptions)
  }

  list (params) {
    return this.communicator.get('/disputes', params)
  }
}
