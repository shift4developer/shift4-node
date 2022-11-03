module.exports = {
  crossSaleOfferWithCharge: (opts) => ({
    charge: {
      amount: 1000,
      currency: 'EUR'
    },
    title: 'Test Title',
    description: 'Test Description',
    termsAndConditionsUrl: 'https://dev.shift4.com/docs/terms',
    template: 'text_only',
    companyName: 'Shift4 Tests',
    companyLocation: 'US',
    ...opts
  })
}
