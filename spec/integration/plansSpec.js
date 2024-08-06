const crypto = require('crypto')
const { Shift4Gateway } = require('../../')
const plans = require('../data/plans')
const assertShift4Exception = require("./assertShift4Exception");

describe('Plans', function () {
  const api = new Shift4Gateway()

  it('should create and get plan', async () => {
    // given
    const planReq = plans.plan()
    // when
    const created = await api.plans.create(planReq)
    const got = await api.plans.get(created.id)
    // then
    expect(got.id).toBeDefined()
    expect(got.interval).toEqual(planReq.interval)
    expect(got.amount).toEqual(planReq.amount)
    expect(got.currency).toEqual(planReq.currency)
    expect(got.interval).toEqual(planReq.interval)
    expect(got.name).toEqual(planReq.name)
  })

  it('should update plan', async () => {
    // given
    const planReq = plans.plan()
    // when
    const created = await api.plans.create(planReq)
    const updated = await api.plans.update(created.id, { amount: 222, currency: 'PLN', name: 'Updated plan' })
    // then
    expect(updated.amount).toEqual(222)
    expect(updated.currency).toEqual('PLN')
    expect(updated.name).toEqual('Updated plan')
  })

  it('should delete plan', async () => {
    // given
    const created = await api.plans.create(plans.plan())
    // when
    await api.plans.delete(created.id)
    const got = await api.plans.get(created.id)
    // then
    expect(created.deleted).toBeFalsy()
    expect(got.deleted).toBeTrue()
  })

  it('should list plans', async () => {
    // given
    const plan1 = await api.plans.create(plans.plan())
    const plan2 = await api.plans.create(plans.plan())
    const deletedPlan = await api.plans.create(plans.plan())
    await api.plans.delete(deletedPlan.id)
    // when
    const all = (await api.plans.list({ limit: 100 }))
      .list.map(it => it.id)
    const deleted = (await api.plans.list({ limit: 100, deleted: true }))
      .list.map(it => it.id)
    // then
    expect(all).toContain(plan1.id)
    expect(all).toContain(plan2.id)
    expect(all).not.toContain(deletedPlan.id)

    expect(deleted).toContain(deletedPlan.id)
    expect(deleted).not.toContain(plan1.id)
    expect(deleted).not.toContain(plan2.id)
  })


  it('should not create duplicate if same idempotency key is used', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const planReq = plans.plan()

    // when
    const firstCallResponse = await api.plans.create(planReq, { 'idempotencyKey': idempotencyKey})
    const secondCallResponse = await api.plans.create(planReq, { 'idempotencyKey': idempotencyKey})

    // then
    expect(secondCallResponse.id).toEqual(firstCallResponse.id)
  })

  it('should create two instances if different idempotency keys are used', async () => {
    // given
    const idempotencyKey1 = crypto.randomUUID()
    const idempotencyKey2 = crypto.randomUUID()
    const planReq = plans.plan()

    // when
    const firstCallResponse = await api.plans.create(planReq, { 'idempotencyKey': idempotencyKey1})
    const secondCallResponse = await api.plans.create(planReq, { 'idempotencyKey': idempotencyKey2})

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should create two instances if no idempotency keys are used', async () => {
    // given
    const planReq = plans.plan()

    // when
    const firstCallResponse = await api.plans.create(planReq)
    const secondCallResponse = await api.plans.create(planReq)

    // then
    expect(secondCallResponse.id).not.toEqual(firstCallResponse.id)
  })

  it('should throw exception if same idempotency key is used for two different create requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const planReq = plans.plan()

    // when
    await api.plans.create(planReq, { 'idempotencyKey': idempotencyKey})
    planReq['amount'] = 42
    const exception = await assertShift4Exception(() => api.plans.create(planReq, { 'idempotencyKey': idempotencyKey}));

    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })

  it('should throw exception if same idempotency key is used for two different update requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()

    const planReq = plans.plan()
    const created = await api.plans.create(planReq)
    const updateRequest = { amount: 42, currency: 'PLN', name: 'Updated plan' }

    // when
    await api.plans.update(created.id, updateRequest, { 'idempotencyKey': idempotencyKey})
    updateRequest['amount'] = 58;
    const exception = await assertShift4Exception(() => api.plans.update(created.id, updateRequest, { 'idempotencyKey': idempotencyKey}))

    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })
})
