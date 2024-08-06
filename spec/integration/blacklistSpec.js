const crypto = require('crypto')
const { Shift4Gateway } = require('../../')
const { randomEmail } = require('../data/random')
const assertShift4Exception = require("./assertShift4Exception");

describe('Blacklist', function () {
  const api = new Shift4Gateway()

  it('should create and get blacklist rule', async () => {
    // given
    const email = randomEmail()
    // when
    const created = await api.blacklist.create({ ruleType: 'email', email })
    const got = await api.blacklist.get(created.id)
    // then
    expect(got.ruleType).toBe('email')
    expect(got.email).toBe(email)
  })

  it('should delete blacklist rule', async () => {
    // given
    const email = randomEmail()
    const created = await api.blacklist.create({ ruleType: 'email', email })
    // when
    await api.blacklist.delete(created.id)
    const got = await api.blacklist.get(created.id)
    // then
    expect(created.deleted).toBeFalsy()
    expect(got.deleted).toBeTrue()
  })

  it('should list cards', async () => {
    // given
    const rule1 = await api.blacklist.create({ ruleType: 'email', email: randomEmail() })
    const rule2 = await api.blacklist.create({ ruleType: 'email', email: randomEmail() })
    const deletedRule = await api.blacklist.create({ ruleType: 'email', email: randomEmail() })
    await api.blacklist.delete(deletedRule.id)
    // when
    const all = (await api.blacklist.list({ limit: 100 }))
      .list.map(it => it.id)
    const deleted = (await api.blacklist.list({ limit: 100, deleted: true }))
      .list.map(it => it.id)
    // then
    expect(all).toContain(rule1.id)
    expect(all).toContain(rule2.id)
    expect(all).not.toContain(deletedRule.id)
    expect(deleted).toContain(deletedRule.id)
    expect(deleted).not.toContain(rule1.id)
    expect(deleted).not.toContain(rule2.id)
  })
  
  it('should not create duplicate if same idempotency key is used', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const email = randomEmail()
    const blacklistRequest = { ruleType: 'email', email }
    
    // when
    const firstCallResponse = await api.blacklist.create(blacklistRequest, { 'idempotencyKey': idempotencyKey})
    const secondCallResponse = await api.blacklist.create(blacklistRequest, { 'idempotencyKey': idempotencyKey})
    
    // then
    expect(firstCallResponse.id).toEqual(secondCallResponse.id)
  })
  
  it('should throw exception if same idempotency key is used for two different create requests', async () => {
    // given
    const idempotencyKey = crypto.randomUUID()
    const email = randomEmail()
    const blacklistRequest = { ruleType: 'email', email }
    
    // when
    await api.blacklist.create(blacklistRequest, { 'idempotencyKey': idempotencyKey})
    blacklistRequest['email'] = 'not_so@random.email'
    const exception = await assertShift4Exception(() => api.blacklist.create(blacklistRequest, { 'idempotencyKey': idempotencyKey}));
    
    // then
    expect(exception.type).toEqual('invalid_request')
    expect(exception.message).toEqual('Idempotent key used for request with different parameters.')
  })
})
