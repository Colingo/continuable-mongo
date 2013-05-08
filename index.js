var mongodb = require("mongodb")
var MongoClient = require("mongodb").MongoClient
var bind = require("continuable/bind")
var map = require("continuable/map")
var cache = require("continuable-cache")

module.exports = mongo

/*  mongo := (uri: String, options: Object?) => db: {
        Continuable<Db>,
        close: Continuable<void>,
        collection: (name: String) => coll: {
            Continuable<Collection>,
            find: (selector: Object, options: Object?) => cursor: {
                Continuable<Cursor>,
                toArray: Continuable<Array<Value>>,
                nextObject: Continuable<Value | null>
            },
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
    }
*/
function mongo(uri, options) {
    if (!options) {
        options = {}
    }

    var client = cache(function (cb) {
        MongoClient.connect(uri, options, cb)
    })

    client.close = mapAsync(function (db, cb) {
        db.close(cb)
    })(client)

    client.collection = createCollection(client)

    return client
}

function createCollection(client) {
    return function collection(name) {
        var col = cache(map(function (db) {
            return db.collection(name)
        })(client))

        col.find = createCursor(col)

        col.findAndModify = function (selector, sort, doc, options) {
            return mapAsync(function (col, cb) {
                col.findAndModify(selector, sort || [],
                    doc || {}, options || {}, cb)
            })(col)
        }

        col.findAndRemove = function (selector, sort, options) {
            return mapAsync(function (col, cb) {
                col.findAndRemove(selector, sort || [], options || {}, cb)
            })(col)
        }

        col.findOne = function (selector, options) {
            return mapAsync(function (col, cb) {
                col.findOne(selector, options || {}, cb)
            })(col)
        }

        col.insert = function (docs, options) {
            return mapAsync(function (col, cb) {
                col.insert(docs, options || {}, cb)
            })(col)
        }

        col.mapReduce = function (map, reduce, options) {
            return mapAsync(function (col, cb) {
                col.mapReduce(map, reduce, options || {}, cb)
            })(col)
        }

        col.remove = function (selector, options) {
            return mapAsync(function (col, cb) {
                col.remove(selector, options || {}, cb)
            })(col)
        }

        col.update = function (selector, doc, options) {
            return mapAsync(function (col, cb) {
                col.update(selector, doc, options || {}, cb)
            })(col)
        }

        return col
    }
}

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

        return cursor
    }
}

function mapAsync(lambda) { return function (source) {
    return bind(function (value) {
        return function continuable(cb) {
            lambda(value, cb)
        }
    })(source)
} }
