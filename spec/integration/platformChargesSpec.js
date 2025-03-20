const crypto = require('crypto')
const { Shift4Gateway } = require('../../')
const cards = require('../data/cards')
const customers = require('../data/customers')
const charges = require('../data/charges')
const assertShift4Exception = require("./assertShift4Exception")

describe('Platform charges', function () {
  const api = new Shift4Gateway({merchantId: process.env.MERCHANT_ID})
  const merchantApi = new Shift4Gateway({secretKey: process.env.MERCHANT_SECRET_KEY, merchantId: null})

  it('should create and get charge', async () => {
    // given
    const chargeReq = charges.charge({ card: cards.card() })
    // when
    const created = await api.charges.create(chargeReq)
    const got = await merchantApi.charges.get(created.id)
    // then
    expect(got.amount).toEqual(chargeReq.amount)
    expect(got.currency).toEqual(chargeReq.currency)
    expect(got.desciption).toEqual(chargeReq.desciption)
    expect(got.metadata.key).toEqual(chargeReq.metadata.key)
  })
})