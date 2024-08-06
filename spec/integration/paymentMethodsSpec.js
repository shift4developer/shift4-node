const crypto = require('crypto')
const { Shift4Gateway } = require('../../')
const paymentMethods = require('../data/paymentMethods')
const customers = require('../data/customers')
const assertShift4Exception = require("./assertShift4Exception");

describe('PaymentMethods', function () {
  const api = new Shift4Gateway()

  it('should create and get paymentMethod', async () => {
    // given
    const paymentMethodReq = paymentMethods.paymentMethod()
    // when
    const created = await api.paymentMethods.create(paymentMethodReq)
    const got = await api.paymentMethods.get(created.id)
    // then
    expect(got.id).toBeDefined()
    expect(got.type).toEqual(paymentMethodReq.type)
    expect(got.billing).toEqual(paymentMethodReq.billing)
    expect(got.status).toEqual('chargeable')
    expect(got.id).toMatch(/^pm_\w+$/)
    expect(got.clientObjectId).toMatch(/^client_pm_\w+$/)
  })

  it('should delete paymentMethod', async () => {
    // given
    const created = await api.paymentMethods.create(paymentMethods.paymentMethod())
    // when
    await api.paymentMethods.delete(created.id)
    const got = await api.paymentMethods.get(created.id)
    // then
    expect(created.deleted).toBeFalsy()
    expect(got.deleted).toBeTrue()
  })

  it('should list paymentMethods', async () => {
    // given
    const customer = await api.customers.create(customers.customer())
    const paymentMethod1 = await api.paymentMethods.create(paymentMethods.paymentMethod({ customerId: customer.id }))
    const paymentMethod2 = await api.paymentMethods.create(paymentMethods.paymentMethod({ customerId: customer.id }))
    const paymentMethod3 = await api.paymentMethods.create(paymentMethods.paymentMethod({ customerId: customer.id }))
    // when
    const all = (await api.paymentMethods.list({ customerId: customer.id }))
      .list.map(it => it.id)
    const afterLastId = (await api.paymentMethods.list({ customerId: customer.id, startingAfterId: paymentMethod3.id }))
      .list.map(it => it.id)
    // then
    expect(all).toEqual([paymentMethod3.id, paymentMethod2.id, paymentMethod1.id])
    expect(afterLastId).toEqual([paymentMethod2.id, paymentMethod1.id])
  })


  it('should not create duplicate if same idempotency key is used', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const paymentMethodReq = paymentMethods.paymentMethod()

    // when
    const firstCallResponse = await api.paymentMethods.create(paymentMethodReq, { 'idempotencyKey': idempotencyKey})
    const secondCallResponse = await api.paymentMethods.create(paymentMethodReq, { 'idempotencyKey': idempotencyKey})

    // then
    expect(secondCallResponse.id).toEqual(firstCallResponse.id)
  })

  it('should create two instances if different idempotency keys are used', async () => {
    // given
    const idempotencyKey1 = crypto.randomUUID()
    const idempotencyKey2 = crypto.randomUUID()
    const paymentMethodReq = paymentMethods.paymentMethod()

    // when
    const firstCallResponse = await api.paymentMethods.create(paymentMethodReq, { 'idempotencyKey': idempotencyKey1})
    const secondCallResponse = await api.paymentMethods.create(paymentMethodReq, { 'idempotencyKey': idempotencyKey2})

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should create two instances if no idempotency keys are used', async () => {
    // given
    const paymentMethodReq = paymentMethods.paymentMethod()

    // when
    const firstCallResponse = await api.paymentMethods.create(paymentMethodReq)
    const secondCallResponse = await api.paymentMethods.create(paymentMethodReq)

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should throw exception if same idempotency key is used for two different create requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const paymentMethodReq = paymentMethods.paymentMethod()

    // when
    await api.paymentMethods.create(paymentMethodReq, { 'idempotencyKey': idempotencyKey})
    paymentMethodReq['type'] = 'apple_pay'
    const exception = await assertShift4Exception(() => api.paymentMethods.create(paymentMethodReq, { 'idempotencyKey': idempotencyKey}));

    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })
})
