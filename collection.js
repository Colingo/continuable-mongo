var map = require("continuable/map")
var mapAsync = require("continuable/map-async")
var maybeCallback = require("continuable/maybe-callback")
var cache = require("continuable-cache")

var proxyMethod = require("./lib/proxy-method.js")
var SafeObjectID = require("./object-id.js")
var createCursor = require("./cursor.js")

module.exports = createCollection

function createCollection(client) {
    return function collection(name) {
        var col = cache(map(client, function getCollection(db) {
            return db.collection(name)
        }))

        col.find = createCursor(col)

        col.findById = maybeCallback(function findById(id, options) {
            return mapAsync(col, function apply(col, cb) {
                SafeObjectID(id, function (err, _id) {
                    if (err) {
                        return cb(err)
                    }

                    col.findOne({ _id: _id }, options || {}, cb)
                })
            })
        })

        col.findAndModify = proxyMethod(col, "findAndModify", [{}, [], {}, {}])
        col.findAndRemove = proxyMethod(col, "findAndRemove", [{}, [], {}])
        col.findOne = proxyMethod(col, "findOne", [{}, {}])
        col.insert = proxyMethod(col, "insert", [[], {}])
        col.mapReduce = proxyMethod(col, "mapReduce", [null, null, {}])
        col.remove = proxyMethod(col, "remove", [{}, {}])
        col.update = proxyMethod(col, "update", [{}, {}, {}])
        col.drop = proxyMethod(col, "drop", [])

        return col
    }
}

