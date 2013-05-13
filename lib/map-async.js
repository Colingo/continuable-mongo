var bind = require("continuable/bind")

module.exports = mapAsync

function mapAsync(lambda) {
    return function duplex(source) {
        return bind(function toContinuable(value) {
            return function continuable(cb) {
                lambda(value, cb)
            }
        })(source)
    }
}
