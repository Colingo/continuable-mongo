var ObjectID = require("mongodb").ObjectID

module.exports = SafeObjectID

function SafeObjectID(id) {
    var result
    try {
        result = new ObjectID(id)
    } catch (err) {
        err.is = "Error"
        result = err
    }

    return result
}
