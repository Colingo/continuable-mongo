var bind = require("continuable/bind")

module.exports = mapAsync

function mapAsync(lambda) { return function (source) {
    return bind(function (value) {
        return function continuable(cb) {
            lambda(value, cb)
        }
    })(source)
} }
