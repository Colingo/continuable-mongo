var Individual = require("individual")
var mongo = require("./index")

var cache = Individual("__CONTINUABLE_MONGO__DB_CACHE", {})

module.exports = createClient

function createClient(uri, options) {
    if (!cache.client) {
        cache.client = mongo(uri, options)
    }

    return cache.client
}
