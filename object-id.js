var ObjectID = require("mongodb").ObjectID

module.exports = SafeObjectID

function SafeObjectID(id, callback) {
    var result
    try {
        result = new ObjectID(id)
    } catch (err) {
        return callback(err)
    }

    callback(null, result)
}
