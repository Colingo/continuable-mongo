var map = require("continuable/map")
var cache = require("continuable-cache")

var createCursor = require("./cursor")
var mapAsync = require("./lib/map-async")

/*  type Collection := {
        (Callback<mongodb/Collection>) => void,
        find: (selector: Object, options: Object?) => Cursor,
        findAndModify: (selector: Object, sort: Array?, doc: Object?,
            options: Object?) => Continuable<Value>,
        findAndRemove: (selector: Object, sort: Array?, options: Object?)
            => Continuable<Value>
        findOne: (selector: Object, options: Object?) => Continuable<Value>,
        insert: (docs: Array<Value>, options: Object?)
            => Continuable<Array<Value>>,
        mapReduce: (map: Function, reduce: Function, options: Object?)
            => Continuable<Collection>,
        remove: (selector: Object, options: Object?)
            => Continuable<Number>,
        update: (selector: Object, doc: Object?, options: Object?)
            => Continuable<Number>
    }

    createCollection := (Client) => (name: String) => Collection

*/
module.exports = createCollection

function createCollection(client) {
    return function collection(name) {
        var col = cache(map(function (db) {
            return db.collection(name)
        })(client))

        col.find = createCursor(col)

        col.findAndModify = maybeCallback(
            function (selector, sort, doc, options) {
                return mapAsync(function (col, cb) {
                    col.findAndModify(selector, sort || [],
                        doc || {}, options || {}, cb)
                })(col)
            })

        col.findAndRemove = maybeCallback(function (selector, sort, options) {
            return mapAsync(function (col, cb) {
                col.findAndRemove(selector, sort || [], options || {}, cb)
            })(col)
        })

        col.findOne = maybeCallback(function (selector, options) {
            return mapAsync(function (col, cb) {
                col.findOne(selector, options || {}, cb)
            })(col)
        })

        col.insert = maybeCallback(function (docs, options) {
            return mapAsync(function (col, cb) {
                col.insert(docs, options || {}, cb)
            })(col)
        })

        col.mapReduce = maybeCallback(function (map, reduce, options) {
            return mapAsync(function (col, cb) {
                col.mapReduce(map, reduce, options || {}, cb)
            })(col)
        })

        col.remove = maybeCallback(function (selector, options) {
            return mapAsync(function (col, cb) {
                col.remove(selector, options || {}, cb)
            })(col)
        })

        col.update = maybeCallback(function (selector, doc, options) {
            return mapAsync(function (col, cb) {
                col.update(selector, doc, options || {}, cb)
            })(col)
        })

        return col
    }
}

function maybeCallback(fn) {
    return function () {
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
