var MongoClient = require("mongodb").MongoClient
var cache = require("continuable-cache")

var createCollection = require("./collection")

module.exports = mongo

/*  type Client := {
        (Callback<mongodb/Db>) => void,
        close: Continuable<void>,
        collection: (name: String) => Collection
    }

    mongo := (uri: String, options: Object?) => Client
*/
function mongo(uri, options) {
    if (!options) {
        options = {}
    }

    var client = cache(function (cb) {
        MongoClient.connect(uri, options, cb)
    })

    client.close = function (cb) {
        client(function (err, db) {
            return err ? cb(err) : db.close(cb)
        })
    }

    client.collection = createCollection(client)

    return client
}

