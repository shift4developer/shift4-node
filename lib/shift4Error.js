module.exports = class Shift4Error extends Error {
  constructor (json) {
    super(JSON.stringify(json))
    this.type = 'Shift4Error'

    if (json.error) {
      this.message = json.error.message
      this.type = json.error.type
      this.code = json.error.code
      this.chargeId = json.error.chargeId
      this.blacklistRuleId = json.error.blacklistRuleId
    }
  }
}
