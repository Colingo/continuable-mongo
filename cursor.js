var map = require("continuable/map")
var cache = require("continuable-cache")
var through = require("through")

var proxyMethod = require("./lib/proxy-method.js")

module.exports = createCursor

function createCursor(collection) {
    return function (selector, options, callback) {
        if (typeof selector === "function") {
            callback = selector
            selector = {}
            options = {}
        }

        if (typeof options === "function") {
            callback = options
            options = {}
        }

        var cursor = cache(map(collection, function find(collection) {
            return collection.find(selector, options || {})
        }))

        cursor.toArray = proxyMethod(cursor, "toArray")
        cursor.nextObject = proxyMethod(cursor, "nextObject")
        cursor.stream = CreateStream(cursor)


        if (callback) {
            callback(null, cursor)
        }

        return cursor
    }
}

function CreateStream(cursor) {
    return function createStream(transform) {
        var stream = through()

        cursor(function callback(err, cursor) {
            if (err) {
                return stream.emit("error", err)
            }

            var cursorStream = cursor.stream(transform)

            stream.once("close", function destroy() {
                cursorStream.destroy()
            })

            cursorStream.pipe(stream)
        })

        return stream
    }
}
