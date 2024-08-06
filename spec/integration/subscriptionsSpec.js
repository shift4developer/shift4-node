const crypto = require('crypto')
const { Shift4Gateway } = require('../../')
const cards = require('../data/cards')
const plans = require('../data/plans')
const customers = require('../data/customers')
const assertShift4Exception = require("./assertShift4Exception");

describe('Subscriptions', function () {
  const api = new Shift4Gateway()

  it('should create and get subscription', async () => {
    // given
    const plan = await api.plans.create(plans.plan())
    const customer = await api.customers.create(customers.customer({ card: cards.card() }))
    const subscriptionReq = { planId: plan.id, customerId: customer.id }
    // when
    const created = await api.subscriptions.create(subscriptionReq)
    const got = await api.subscriptions.get(created.id)
    // then
    expect(got.id).toBeDefined()
    expect(got.planId).toEqual(plan.id)
    expect(got.customerId).toEqual(customer.id)
  })

  it('should update subscription', async () => {
    // given
    const plan = await api.plans.create(plans.plan())
    const customer = await api.customers.create(customers.customer({ card: cards.card() }))
    const created = await api.subscriptions.create({ planId: plan.id, customerId: customer.id })

    // when
    const updated = await api.subscriptions.update(created.id, {
      shipping: {
        name: 'Updated shipping',
        address: {
          line1: 'Updated line1',
          line2: 'Updated line2',
          zip: 'Updated zip',
          city: 'Updated city',
          state: 'Updated state',
          country: 'CH'
        }
      }
    })

    // then
    expect(created.shipping).toBeUndefined()
    expect(updated.id).toEqual(created.id)
    expect(updated.planId).toEqual(plan.id)

    const shipping = updated.shipping
    expect(shipping.name).toEqual('Updated shipping')
    expect(shipping.address.line1).toEqual('Updated line1')
    expect(shipping.address.line2).toEqual('Updated line2')
    expect(shipping.address.zip).toEqual('Updated zip')
    expect(shipping.address.city).toEqual('Updated city')
    expect(shipping.address.state).toEqual('Updated state')
    expect(shipping.address.country).toEqual('CH')
  })

  it('should cancel subscription', async () => {
    // given
    const plan = await api.plans.create(plans.plan())
    const customer = await api.customers.create(customers.customer({ card: cards.card() }))
    const created = await api.subscriptions.create({ planId: plan.id, customerId: customer.id })
    // when
    await api.subscriptions.cancel(created.id)
    const got = await api.subscriptions.get(created.id)
    // then
    expect(created.canceledAt).toBeFalsy()
    expect(got.status).toEqual('canceled')
    expect(got.canceledAt).toBeDefined()
  })

  it('should list subscriptions', async () => {
    // given
    const plan = await api.plans.create(plans.plan())
    const customer = await api.customers.create(customers.customer({ card: cards.card() }))
    const subscription1 = await api.subscriptions.create({ planId: plan.id, customerId: customer.id })
    const subscription2 = await api.subscriptions.create({ planId: plan.id, customerId: customer.id })
    const deletedSubscription = await api.subscriptions.create({ planId: plan.id, customerId: customer.id })
    await api.subscriptions.cancel(deletedSubscription.id)
    // when
    const all = (await api.subscriptions.list({ customerId: customer.id }))
      .list.map(it => it.id)
    const deleted = (await api.subscriptions.list({ customerId: customer.id, deleted: true }))
      .list.map(it => it.id)
    // then
    expect(all).toEqual([subscription2.id, subscription1.id])
    expect(deleted).toEqual([deletedSubscription.id])
  })


  it('should not create duplicate if same idempotency key is used', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()

    const plan = await api.plans.create(plans.plan())
    const customer = await api.customers.create(customers.customer({ card: cards.card() }))
    const subscriptionReq = { planId: plan.id, customerId: customer.id }

    // when
    const firstCallResponse = await api.subscriptions.create(subscriptionReq, { 'idempotencyKey': idempotencyKey})
    const secondCallResponse = await api.subscriptions.create(subscriptionReq, { 'idempotencyKey': idempotencyKey})

    // then
    expect(secondCallResponse.id).toEqual(firstCallResponse.id)
  })

  it('should create two instances if different idempotency keys are used', async () => {
    // given
    const idempotencyKey1 = crypto.randomUUID()
    const idempotencyKey2 = crypto.randomUUID()

    const plan = await api.plans.create(plans.plan())
    const customer = await api.customers.create(customers.customer({ card: cards.card() }))
    const subscriptionReq = { planId: plan.id, customerId: customer.id }

    // when
    const firstCallResponse = await api.subscriptions.create(subscriptionReq, { 'idempotencyKey': idempotencyKey1})
    const secondCallResponse = await api.subscriptions.create(subscriptionReq, { 'idempotencyKey': idempotencyKey2})

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should create two instances if no idempotency keys are used', async () => {
    // given
    const plan = await api.plans.create(plans.plan())
    const customer = await api.customers.create(customers.customer({ card: cards.card() }))
    const subscriptionReq = { planId: plan.id, customerId: customer.id }

    // when
    const firstCallResponse = await api.subscriptions.create(subscriptionReq)
    const secondCallResponse = await api.subscriptions.create(subscriptionReq)

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should throw exception if same idempotency key is used for two different create requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()

    const plan = await api.plans.create(plans.plan())
    const customer = await api.customers.create(customers.customer({ card: cards.card() }))
    const subscriptionReq = { planId: plan.id, customerId: customer.id }

    // when
    await api.subscriptions.create(subscriptionReq, { 'idempotencyKey': idempotencyKey})
    subscriptionReq['planId'] = 42
    const exception = await assertShift4Exception(() => api.subscriptions.create(subscriptionReq, { 'idempotencyKey': idempotencyKey}));

    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })

  it('should throw exception if same idempotency key is used for two different update requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()

    const plan = await api.plans.create(plans.plan())
    const customer = await api.customers.create(customers.customer({ card: cards.card() }))
    const created = await api.subscriptions.create({ planId: plan.id, customerId: customer.id })
    const updateRequest = {
      shipping: {
        name: 'Updated shipping',
        address: {
          line1: 'Updated line1',
          line2: 'Updated line2',
          zip: 'Updated zip',
          city: 'Updated city',
          state: 'Updated state',
          country: 'CH'
        }
      }
    }

    // when
    await api.subscriptions.update(created.id, updateRequest, { 'idempotencyKey': idempotencyKey})
    updateRequest['name'] = 'Updated shipping - again'
    const exception = await assertShift4Exception(() => api.subscriptions.update(created.id, updateRequest, { 'idempotencyKey': idempotencyKey}))

    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })
})
