Shift4 Node.js Library
===================================

[![Build](https://github.com/shift4developer/shift4-node/actions/workflows/build.yml/badge.svg)](https://github.com/shift4developer/shift4-node/actions/workflows/build.yml)

Installation
------------

```sh
npm install shift4
```

Quick start
-----------


```js
const api = require('shift4')('sk_test_my_secret_key');
(async () => {
  try {
    const customer = await api.customers.create({
      email: 'user@example.com',
      description: 'User description'
    })
    console.log('ID of created customer object: ', customer.id);

    const card = await api.cards.create(customer.id, {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '2025',
      cvc: '123',
      cardholderName: 'John Smith'
    })
    console.log('ID of created card object: ', card.id);

    const charge = await api.charges.create({
      amount: 1000,
      currency: "EUR",
      card: card.id,
      customerId: customer.id
    });
    console.log('ID of created charge object: ', charge.id);
  } catch (e) {
    console.error(e)
    // handle errors
  }
})();

```

API reference
-------------

Please refer to detailed API docs (linked) for all available fields

- charges
  - [create(params)](https://dev.shift4.com/docs/api#charge-create)
  - [get(chargeId)](https://dev.shift4.com/docs/api#charge-retrieve)
  - [update(chargeId, params)](https://dev.shift4.com/docs/api#charge-update)
  - [capture(chargeId)](https://dev.shift4.com/docs/api#charge-capture)
  - [refund(chargeId, [params])](https://dev.shift4.com/docs/api#charge-capture)
  - [list([params])](https://dev.shift4.com/docs/api#charge-list)
- customers
  - [create(params)](https://dev.shift4.com/docs/api#customer-create)
  - [get(customerId)](https://dev.shift4.com/docs/api#customer-retrieve)
  - [update(customerId, params)](https://dev.shift4.com/docs/api#customer-update)
  - [delete(customerId)](https://dev.shift4.com/docs/api#customer-delete)
  - [list([params])](https://dev.shift4.com/docs/api#customer-list)
- cards
  - [create(customerId, params)](https://dev.shift4.com/docs/api#card-create)
  - [get(customerId, cardId)](https://dev.shift4.com/docs/api#card-retrieve)
  - [update(customerId, cardId, params)](https://dev.shift4.com/docs/api#card-update)
  - [delete(customerId, cardId)](https://dev.shift4.com/docs/api#card-delete)
  - [list(customerId, [params])](https://dev.shift4.com/docs/api#card-list)
- subscriptions
  - [create(params)](https://dev.shift4.com/docs/api#subscription-create)
  - [get(subscriptionId)](https://dev.shift4.com/docs/api#subscription-retrieve)
  - [update(subscriptionId, params)](https://dev.shift4.com/docs/api#subscription-update)
  - [cancel(subscriptionId, [params])](https://dev.shift4.com/docs/api#subscription-cancel)
  - [list([params])](https://dev.shift4.com/docs/api#subscription-list)
- plans
  - [create(params)](https://dev.shift4.com/docs/api#plan-create)
  - [get(planId)](https://dev.shift4.com/docs/api#plan-retrieve)
  - [update(planId, params)](https://dev.shift4.com/docs/api#plan-update)
  - [delete(planId)](https://dev.shift4.com/docs/api#plan-delete)
  - [list([params])](https://dev.shift4.com/docs/api#plan-list)
- events
  - [get(eventId)](https://dev.shift4.com/docs/api#event-retrieve)
  - [list([params])](https://dev.shift4.com/docs/api#event-list)
- tokens
  - [create(params)](https://dev.shift4.com/docs/api#token-create)
  - [get(tokenId)](https://dev.shift4.com/docs/api#token-retrieve)
- blacklist
  - [create(params)](https://dev.shift4.com/docs/api#blacklist-rule-create)
  - [get(blacklistRuleId)](https://dev.shift4.com/docs/api#blacklist-rule-retrieve)
  - [delete(blacklistRuleId)](https://dev.shift4.com/docs/api#blacklist-rule-delete)
  - [list([params])](https://dev.shift4.com/docs/api#blacklist-rule-list)
- checkoutRequest
  - [sign(checkoutRequestObjectOrJson)](https://dev.shift4.com/docs/api#checkout-request-sign)
- credits
  - [create(params)](https://dev.shift4.com/docs/api#credit-create)
  - [get(creditId)](https://dev.shift4.com/docs/api#credit-retrieve)
  - [update(creditId, params)](https://dev.shift4.com/docs/api#credit-update)
  - [list([params])](https://dev.shift4.com/docs/api#credit-list)
- disputes
  - [get(disputeId)](https://dev.shift4.com/docs/api#dispute-retrieve)
  - [update(disputeId, params)](https://dev.shift4.com/docs/api#dispute-update)
  - [close(disputeId)](https://dev.shift4.com/docs/api#dispute-close)
  - [list([params])](https://dev.shift4.com/docs/api#dispute-list)
- fileUploads
  - [upload(content, params)](https://dev.shift4.com/docs/api#file-upload-create)
  - [get(fileUploadId)](https://dev.shift4.com/docs/api#file-upload-retrieve)
  - [list([params])](https://dev.shift4.com/docs/api#file-upload-list)
- fraudWarnings
  - [get(fraudWarningId)](https://dev.shift4.com/docs/api#fraud-warning-retrieve)
  - [list([params])](https://dev.shift4.com/docs/api#fraud-warning-list)
- paymentMethods
  - [create(params)](https://dev.shift4.com/docs/api#payment-method-create)
  - [retrieve(payment_method_id)](https://dev.shift4.com/docs/api#payment-method-retrieve)
  - [delete(payment_method_id)](https://dev.shift4.com/docs/api#payment-method-delete)
  - [list([params])](https://dev.shift4.com/docs/api#payment-methods-list)

For further information, please refer to our official documentation at [https://dev.shift4.com/docs](https://dev.shift4.com/docs)

Developing
----------

To connect to different backend:

```js
var api = require('shift4')({
  secretKey: 'sk_test_my_secret_key',
  apiUrl: 'https://api.myshift4env.com',
  uploadsUrl: 'https://uploads.myshift4env.com'
});
```

To run tests:

```sh
SECRET_KEY=sk_test_my_secret_key npm run test
```

To run style check:

```sh
npm run stylecheck
```