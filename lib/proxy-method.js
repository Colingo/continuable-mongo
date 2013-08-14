var mapAsync = require("continuable/map-async")
var maybeCallback = require("continuable/maybe-callback")

var slice = Array.prototype.slice

module.exports = proxyMethod

function proxyMethod(obj, methodName, defaults) {
    return maybeCallback(function call() {
        var upperArgs = slice.call(arguments)
        return mapAsync(obj, function apply(obj, callback) {
            var innerArgs = upperArgs.concat([callback])

            if (defaults) {
                for (var i = 0; i < defaults.length; i++) {
                    if (innerArgs[i] === undefined) {
                        innerArgs[i] = defaults[i]
                    }
                }
            }

            obj[methodName].apply(obj, innerArgs)
        })
    })
}
