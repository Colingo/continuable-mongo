var map = require("continuable/map")
var cache = require("continuable-cache")
var through = require("through")

var mapAsync = require("./lib/map-async")
var maybeCallback = require("./lib/maybe-callback")

/*  type Cursor := {
        (Callback<mongodb/Cursor>) => void,
        toArray: () => Continuable<Array<Value>>,
        nextObject: () => Continuable<Value | null>,
        stream: () => Stream
    }

    createCursor := (Collection) =>
        (selector: Object, options: Object?) => Cursor
*/
module.exports = createCursor

function createCursor(collection) {
    return function (selector, options) {
        var cursor = cache(map(function find(collection) {
            return collection.find(selector, options || {})
        })(collection))

        cursor.toArray = maybeCallback(function toArray() {
            return mapAsync(function apply(cursor, cb) {
                cursor.toArray(cb)
            })(cursor)
        })

        cursor.nextObject = maybeCallback(function nextObject() {
            return mapAsync(function apply(cursor, cb) {
                cursor.nextObject(cb)
            })(cursor)
        })

        cursor.stream = CreateStream(cursor)

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
