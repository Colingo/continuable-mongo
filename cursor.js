var map = require("continuable/map")
var cache = require("continuable-cache")
var through = require("through")

var mapAsync = require("./lib/map-async")

/*  type Cursor := {
        (Callback<mongodb/Cursor>) => void,
        toArray: Continuable<Array<Value>>,
        nextObject: Continuable<Value | null>,
        stream: () => Stream
    }

    createCursor := (Collection) =>
        (selector: Object, options: Object?) => Cursor
*/
module.exports = createCursor

function createCursor(collection) {
    return function (selector, options) {
        var cursor = cache(map(function (collection) {
            return collection.find(selector, options || {})
        })(collection))

        cursor.toArray = mapAsync(function (cursor, cb) {
            cursor.toArray(cb)
        })(cursor)

        cursor.nextObject = mapAsync(function (cursor, cb) {
            cursor.nextObject(cb)
        })(cursor)

        cursor.stream = createStream(cursor)

        return cursor
    }
}

function createStream(cursor) {
    return function () {
        var stream = through()

        cursor(function (err, cursor) {
            if (err) {
                return stream.emit("error", err)
            }

            var cursorStream = cursor.stream()

            stream.once("close", function () {
                cursorStream.destroy()
            })

            cursorStream.pipe(stream)
        })

        return stream
    }
}
