var test = require("tape")
var uuid = require("uuid")
var bind = require("continuable/bind")

var mongo = require("../index")

test("continuable-mongo is a function", function (assert) {
    assert.equal(typeof mongo, "function")
    assert.end()
})

test("can insert and read from db", function (assert) {
    var client = mongo("mongodb://localhost:27017/continuable-mongo-tests")
    var temp = client.collection("temp_collection")
    var id = uuid()

    var insertion = temp.insert([{ id: id }])

    var record = bind(function (x) {
        assert.equal(x.length, 1)

        return temp.findOne({ id: id })
    })(insertion)

    record(function (err, value) {
        assert.ifError(err)
        assert.equal(value.id, id)

        client.close(function (err) {
            assert.ifError(err)

            assert.end()
        })
    })
})
