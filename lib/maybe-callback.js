module.exports = maybeCallback

function maybeCallback(fn) {
    return function maybeContinuable() {
        var args = [].slice.call(arguments)
        var callback = args[args.length - 1]

        if (typeof callback === "function") {
            args.pop()
        }

        var continuable = fn.apply(null, args)

        if (typeof callback === "function") {
            continuable(callback)
        } else {
            return continuable
        }
    }
}
