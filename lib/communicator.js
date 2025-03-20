const Shift4Error = require('./shift4Error')
const version = require('./version')
const fetch = require('node-fetch')

function removeTrailingSlash (url) {
  if (url.charAt(url.length - 1) === '/') {
    return url.substring(0, url.length - 1)
  } else {
    return url
  }
}

module.exports = class Communicator {
  constructor ({ secretKey, url, merchantId }) {
    this.secretKey = secretKey
    this.url = removeTrailingSlash(url)
    this.merchantId = merchantId
  }

  async post (path, body, requestOptions) {
    const headers = { 'Content-Type': 'application/json' };
    if (!!requestOptions && !!requestOptions['idempotencyKey']) {
      headers['Idempotency-Key'] = requestOptions['idempotencyKey']
    }
    if (!!this.merchantId) {
      headers['Shift4-Merchant'] = this.merchantId
    }
    return this.call('POST', path, JSON.stringify(body), headers)
  }

  async postMultipart (path, body) {
    return this.call('POST', path, body)
  }

  async get (path, params) {
    return this.call('GET', `${path}?${new URLSearchParams(params)}`)
  }

  async delete (path) {
    return this.call('DELETE', `${path}`)
  }

  async call (method, path, body = undefined, headers = {}) {
    // noinspection JSDeprecatedSymbols
    const response = await fetch(`${this.url}${path}`, {
      method,
      body,
      headers: {
        'User-Agent': `Shift4-Node/${version} (Ruby/${process.version})`,
        Authorization: `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
        ...headers
      }
    })
    const json = await response.json()

    if (response.ok) {
      return json
    } else {
      throw new Shift4Error(json)
    }
  }
}
