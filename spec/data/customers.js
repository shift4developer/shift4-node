const random = require('./random')
module.exports = {
  customer: (opts) => ({
    email: `testEmail+${random.randomString()}@dev.shift4.com`,
    ...opts
  })
}
