var map = require("continuable/map")
var cache = require("continuable-cache")

var SafeObjectID = require("./object-id")
var createCursor = require("./cursor")
var mapAsync = require("./lib/map-async")
var maybeCallback = require("./lib/maybe-callback")

/*  type Collection := {
        (Callback<mongodb/Collection>) => void,
        find: (selector: Object, options: Object?) => Cursor,
        findById: (id: String, options: Object?) => Continuable<Value>,
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
        var col = cache(map(function getCollection(db) {
            return db.collection(name)
        })(client))

        col.find = createCursor(col)

        col.findById = maybeCallback(function findById(id, options) {
            return mapAsync(function apply(col, cb) {
                var _id = SafeObjectID(id)

                if (_id.is === "Error") {
                    return cb(_id)
                }

                col.findOne({ _id: _id }, options || {}, cb)
            })(col)
        })

        col.findAndModify = maybeCallback(
            function findAndModify(selector, sort, doc, options) {
                return mapAsync(function apply(col, cb) {
                    col.findAndModify(selector, sort || [],
                        doc || {}, options || {}, cb)
                })(col)
            })

        col.findAndRemove = maybeCallback(
            function findAndRemove(selector, sort, options) {
                return mapAsync(function apply(col, cb) {
                    col.findAndRemove(selector, sort || [], options || {}, cb)
                })(col)
            })

        col.findOne = maybeCallback(
            function findOne(selector, options) {
                return mapAsync(function apply(col, cb) {
                    col.findOne(selector, options || {}, cb)
                })(col)
            })

        col.insert = maybeCallback(
            function insert(docs, options) {
                return mapAsync(function apply(col, cb) {
                    col.insert(docs, options || {}, cb)
                })(col)
            })

        col.mapReduce = maybeCallback(
            function mapReduce(map, reduce, options) {
                return mapAsync(function apply(col, cb) {
                    col.mapReduce(map, reduce, options || {}, cb)
                })(col)
            })

        col.remove = maybeCallback(
            function remove(selector, options) {
                return mapAsync(function apply(col, cb) {
                    col.remove(selector, options || {}, cb)
                })(col)
            })

        col.update = maybeCallback(
            function update(selector, doc, options) {
                return mapAsync(function apply(col, cb) {
                    col.update(selector, doc, options || {}, cb)
                })(col)
            })

        return col
    }
}
