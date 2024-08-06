const crypto = require('crypto')
const { Shift4Gateway } = require('../../')
const cards = require('../data/cards')
const { randomEmail } = require('../data/random')
const customers = require('../data/customers')
const assertShift4Exception = require("./assertShift4Exception");

describe('Customers', function () {
  const api = new Shift4Gateway()

  it('should create and get customer', async () => {
    // given
    const email = randomEmail()
    const customerReq = customers.customer({ email })
    // when
    const created = await api.customers.create(customerReq)
    const got = await api.customers.get(created.id)
    // then
    expect(got.id).toBeDefined()
    expect(got.email).toEqual(email)
  })

  it('should update customer default card', async () => {
    // given
    const created = await api.customers.create(customers.customer({ card: cards.card() }))
    // when
    const newCard = await api.cards.create(created.id, cards.card())
    const updated = await api.customers.update(created.id, { defaultCardId: newCard.id })
    // then
    expect(created.defaultCardId).not.toEqual(newCard.id)
    expect(updated.defaultCardId).toEqual(newCard.id)
  })

  it('should delete customer', async () => {
    // given
    const created = await api.customers.create(customers.customer())
    // when
    await api.customers.delete(created.id)
    const got = await api.customers.get(created.id)
    // then
    expect(created.deleted).toBeFalsy()
    expect(got.deleted).toBeTrue()
  })

  it('should list customers', async () => {
    // given
    const email = randomEmail()
    const customer1 = await api.customers.create({ email })
    const customer2 = await api.customers.create({ email })
    const deletedCustomer = await api.customers.create({ email })
    await api.customers.delete(deletedCustomer.id)
    // when
    const all = (await api.customers.list({ email }))
      .list.map(it => it.id)
    const deleted = (await api.customers.list({ email, deleted: true }))
      .list.map(it => it.id)
    // then
    expect(all).toEqual([customer2.id, customer1.id])
    expect(deleted).toEqual([deletedCustomer.id])
  })


  it('should not create duplicate if same idempotency key is used', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const email = randomEmail()
    const customerReq = customers.customer({ email })

    // when
    const firstCallResponse = await api.customers.create(customerReq, { 'idempotencyKey': idempotencyKey})
    const secondCallResponse = await api.customers.create(customerReq, { 'idempotencyKey': idempotencyKey})

    // then
    expect(secondCallResponse.id).toEqual(firstCallResponse.id)
  })

  it('should create two instances if different idempotency keys are used', async () => {
    // given
    const idempotencyKey1 = crypto.randomUUID()
    const idempotencyKey2 = crypto.randomUUID()
    const email = randomEmail()
    const customerReq = customers.customer({ email })

    // when
    const firstCallResponse = await api.customers.create(customerReq, { 'idempotencyKey': idempotencyKey1})
    const secondCallResponse = await api.customers.create(customerReq, { 'idempotencyKey': idempotencyKey2})

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should create two instances if no idempotency keys are used', async () => {
    // given
    const email = randomEmail()
    const customerReq = customers.customer({ email })

    // when
    const firstCallResponse = await api.customers.create(customerReq)
    const secondCallResponse = await api.customers.create(customerReq)

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should throw exception if same idempotency key is used for two different create requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const email = randomEmail()
    const customerReq = customers.customer({ email })

    // when
    await api.customers.create(customerReq, { 'idempotencyKey': idempotencyKey})
    customerReq['customerReq'] = 'not_so@random.email'
    const exception = await assertShift4Exception(() => api.customers.create(customerReq, { 'idempotencyKey': idempotencyKey}));

    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })

  it('should throw exception if same idempotency key is used for two different update requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const created = await api.customers.create(customers.customer({ card: cards.card() }))
    const newCard = await api.cards.create(created.id, cards.card())
    const newestCard = await api.cards.create(created.id, cards.card())
    const updateRequest = { defaultCardId: newCard.id }

    // when
    await api.customers.update(created.id, updateRequest, { 'idempotencyKey': idempotencyKey})
    updateRequest['defaultCardId'] = newestCard;
    const exception = await assertShift4Exception(() => api.customers.update(created.id, updateRequest, { 'idempotencyKey': idempotencyKey}))

    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })
})
