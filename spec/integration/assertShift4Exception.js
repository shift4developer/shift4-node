const Shift4Error = require("../../lib/shift4Error");

module.exports = async function assertShift4Exception(fn) {
    return await fn()
      .catch(exception => {
        if (exception instanceof Shift4Error) {
          return exception
        } else {
          throw exception;
        }
      })
}