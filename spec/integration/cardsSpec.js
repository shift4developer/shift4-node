const crypto = require('crypto')
const { Shift4Gateway } = require('../../')
const cards = require('../data/cards')
const customers = require('../data/customers')
const assertShift4Exception = require("./assertShift4Exception");

describe('Cards', function () {
  const api = new Shift4Gateway()

  it('should create and get card', async () => {
    // given
    const customer = await api.customers.create(customers.customer())
    // when
    const created = await api.cards.create(customer.id, {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '2055',
      cvc: '123',
      cardholderName: 'Test Name'
    })
    const got = await api.cards.get(customer.id, created.id)
    // then
    expect(got.first6).toBe('424242')
    expect(got.last4).toBe('4242')
    expect(got.expMonth).toBe('12')
    expect(got.expYear).toBe('2055')
    expect(got.cardholderName).toBe('Test Name')
  })

  it('should update card', async () => {
    // given
    const customer = await api.customers.create(customers.customer())
    const created = await api.cards.create(customer.id, cards.card())
    // when
    const updated = await api.cards.update(customer.id, created.id, {
      expMonth: '05',
      expYear: '55',
      cardholderName: 'updated cardholderName',
      addressCountry: 'updated addressCountry',
      addressCity: 'updated addressCity',
      addressState: 'updated addressState',
      addressZip: 'updated addressZip',
      addressLine1: 'updated addressLine1',
      addressLine2: 'updated addressLine2'
    })
    // then
    expect(updated.expMonth).toBe('05')
    expect(updated.expYear).toBe('2055')
    expect(updated.cardholderName).toBe('updated cardholderName')
    expect(updated.addressCountry).toBe('updated addressCountry')
    expect(updated.addressCity).toBe('updated addressCity')
    expect(updated.addressState).toBe('updated addressState')
    expect(updated.addressZip).toBe('updated addressZip')
    expect(updated.addressLine1).toBe('updated addressLine1')
    expect(updated.addressLine2).toBe('updated addressLine2')
  })

  it('should delete card', async () => {
    // given
    const customer = await api.customers.create(customers.customer())
    const created = await api.cards.create(customer.id, cards.card())
    // when
    await api.cards.delete(customer.id, created.id)
    const deleted = await api.cards.get(customer.id, created.id)
    // then
    expect(created.deleted).toBeFalsy()
    expect(deleted.deleted).toBeTrue()
  })

  it('should list cards', async () => {
    // given
    const customer1 = await api.customers.create(customers.customer())
    const customer2 = await api.customers.create(customers.customer())
    const card11 = await api.cards.create(customer1.id, cards.card())
    const card12 = await api.cards.create(customer1.id, cards.card())
    const card21 = await api.cards.create(customer2.id, cards.card())
    // when
    const customer1Cards = await api.cards.list(customer1.id)
    const customer1CardsLimit1 = await api.cards.list(customer1.id, { limit: 1 })
    const customer2Cards = await api.cards.list(customer2.id)
    // then
    expect(customer1Cards.list.map(it => it.id)).toEqual([card12.id, card11.id])
    expect(customer1CardsLimit1.list.map(it => it.id)).toEqual([card12.id])
    expect(customer2Cards.list.map(it => it.id)).toEqual([card21.id])
  })


  it('should not create duplicate if same idempotency key is used', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const customer = await api.customers.create(customers.customer())
    const cardsReq = {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '2055',
      cvc: '123',
      cardholderName: 'Test Name'
    }

    // when
    const firstCallResponse = await api.cards.create(customer.id, cardsReq,{'idempotencyKey': idempotencyKey})
    const secondCallResponse = await api.cards.create(customer.id, cardsReq,{'idempotencyKey': idempotencyKey})

    // then
    expect(secondCallResponse.id).toEqual(firstCallResponse.id)
  })

  it('should create two instances if different idempotency keys are used', async () => {
    // given
    const idempotencyKey1 = crypto.randomUUID();
    const idempotencyKey2 = crypto.randomUUID();
    const customer = await api.customers.create(customers.customer())
    const cardsReq = {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '2055',
      cvc: '123',
      cardholderName: 'Test Name'
    }

    // when
    const firstCallResponse = await api.cards.create(customer.id, cardsReq,{'idempotencyKey': idempotencyKey1})
    const secondCallResponse = await api.cards.create(customer.id, cardsReq,{'idempotencyKey': idempotencyKey2})

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should create two instances if no idempotency keys are used', async () => {
    // given
    const customer = await api.customers.create(customers.customer())
    const cardsReq = {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '2055',
      cvc: '123',
      cardholderName: 'Test Name'
    }

    // when
    const firstCallResponse = await api.cards.create(customer.id, cardsReq)
    const secondCallResponse = await api.cards.create(customer.id, cardsReq)

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should throw exception if same idempotency key is used for two different create requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const customer = await api.customers.create(customers.customer())
    const cardsReq = {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '2055',
      cvc: '123',
      cardholderName: 'Test Name'
    }

    // when
    await api.cards.create(customer.id, cardsReq,{'idempotencyKey': idempotencyKey})
    cardsReq['cvc'] = '042'
    const exception = await assertShift4Exception(() => api.cards.create(customer.id, cardsReq,{'idempotencyKey': idempotencyKey}));

    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })

  it('should throw exception if same idempotency key is used for two different update requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const customer = await api.customers.create(customers.customer())
    const created = await api.cards.create(customer.id, cards.card())
    const updateRequest = {
      expMonth: '05',
      expYear: '55',
      cardholderName: 'updated cardholderName',
      addressCountry: 'updated addressCountry',
      addressCity: 'updated addressCity',
      addressState: 'updated addressState',
      addressZip: 'updated addressZip',
      addressLine1: 'updated addressLine1',
      addressLine2: 'updated addressLine2'
    }

    // when
    await api.cards.update(customer.id, created.id, updateRequest,{'idempotencyKey': idempotencyKey})
    updateRequest['expYear'] = '42'
    const exception = await assertShift4Exception(() => api.cards.update(customer.id, created.id, updateRequest,{'idempotencyKey': idempotencyKey}))

    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })
})
