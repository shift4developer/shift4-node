const { Shift4Gateway } = require('../../')
if (process.env.API_URL) {
  Shift4Gateway.defaultOptions.apiUrl = process.env.API_URL
}
if (process.env.UPLOADS_URL) {
  Shift4Gateway.defaultOptions.uploadsUrl = process.env.UPLOADS_URL
}
if (process.env.SECRET_KEY) {
  Shift4Gateway.defaultOptions.secretKey = process.env.SECRET_KEY
}
