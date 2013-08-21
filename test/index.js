var test = require("tape")
var uuid = require("uuid")
var chain = require("continuable/chain")

var mongo = require("../index")

var client = mongo("mongodb://localhost:27017/continuable-mongo-tests")
var temp = client.collection("temp_collection")

test("continuable-mongo is a function", function (assert) {
    assert.equal(typeof mongo, "function")
    assert.end()
})

test("can insert and read from db", function (assert) {
    var id = uuid()

    var insertion = temp.insert([{ id: id }])

    var record = chain(insertion, function (records) {
        assert.equal(records.length, 1)

        return temp.findOne({ id: id })
    })

    record(function (err, value) {
        assert.ifError(err)
        assert.equal(value.id, id)

        assert.end()
    })
})

test("can insert & read from db (callbacks)", function (assert) {
    var id = uuid()

    temp.insert([{ id: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 1)

        temp.findOne({ id: id }, function (err, value) {
            assert.ifError(err)
            assert.equal(value.id, id)

            assert.end()
        })
    })
})

test("can findById", function (assert) {
    var id = uuid()

    temp.insert([{ id: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 1)

        var _id = String(records[0]._id)

        temp.findById(_id, function (err, record) {
            assert.ifError(err)
            assert.equal(record.id, id)

            assert.end()
        })
    })
})

test("can call stream on cursor", function (assert) {
    var temp = client.collection("stream_collection_" + uuid())
    var id = uuid()

    temp.insert([{ id: id }, { id2: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 2)

        var stream = temp.find().stream()
        var list = []

        stream.on("data", function (r) {
            list.push(r)
        })

        stream.on("end", function () {
            assert.equal(list.length, 2)
            assert.equal(list[0].id, id)
            assert.equal(list[1].id2, id)

            assert.end()
        })
    })
})

test("can call toArray continuable style", function (assert) {
    var temp = client.collection("toArray_continuable_" + uuid())
    var id = uuid()

    temp.insert([{ id: id }, { id2: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 2)

        var arr = temp.find().toArray()

        arr(function (err, list) {
            assert.ifError(err)
            assert.equal(list.length, 2)
            assert.equal(list[0].id, id)
            assert.equal(list[1].id2, id)

            assert.end()
        })
    })
})

test("can call toArray callback style", function (assert) {
    var temp = client.collection("toArray_callback_" + uuid())
    var id = uuid()

    temp.insert([{ id: id }, { id2: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 2)

        temp.find().toArray(function (err, list) {
            assert.ifError(err)
            assert.equal(list.length, 2)
            assert.equal(list[0].id, id)
            assert.equal(list[1].id2, id)

            assert.end()
        })
    })
})

test("can call toArray with a callback on find()", function (assert) {
    var temp = client.collection("toArray_callback_" + uuid())
    var id = uuid()

    temp.insert([{ id: id }, { id2: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 2)

        temp.find(function (err, cursor) {
            assert.ifError(err)

            cursor.toArray(function (err, list) {
                assert.ifError(err)
                assert.equal(list.length, 2)
                assert.equal(list[0].id, id)
                assert.equal(list[1].id2, id)

                assert.end()
            })
        })
    })
})

test("can findAndModify", function (assert) {
    var id = uuid()
    var temp = client.collection("findAndModify_" + uuid())

    temp.insert([{ id: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 1)

        temp.findAndModify({ id: id }, [["_id", -1]], {
            $set: { foo: "bar" }
        }, { new: true }, function (err, result) {
            assert.ifError(err)
            assert.equal(result.foo, "bar")

            assert.end()
        })
    })
})

test("can findAndRemove", function (assert) {
    var id = uuid()
    var temp = client.collection("findAndRemove_" + uuid())

    temp.insert([{ id: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 1)

        temp.findAndRemove({ id: id }, [["_id", -1]], function (err, res) {
            assert.ifError(err)
            assert.equal(res.id, id)

            assert.end()
        })
    })
})

test("remove", function (assert) {
    var id = uuid()
    var temp = client.collection("remove_" + uuid())

    temp.insert([{ id: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 1)

        temp.remove({ id: id }, function (err, res) {
            assert.ifError(err)
            assert.equal(res, 1)

            assert.end()
        })
    })
})

test("update", function (assert) {
    var id = uuid()
    var temp = client.collection("update_" + uuid())

    temp.insert([{ id: id }], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 1)

        temp.update({ id: id }, { $set: { foo: "bar" } }, function (err, res) {
            assert.ifError(err)
            assert.equal(res, 1)

            temp.findOne({ id: id }, function (err, record) {
                assert.ifError(err)
                assert.equal(record.foo, "bar")

                assert.end()
            })
        })
    })
})

test("map FFFFF reduce", function (assert) {
    var temp = client.collection("mapReduce_" + uuid())

    temp.insert([
        { name: "steve", count: 5 },
        { name: "bob", count: 3 },
        { name: "mary", count: 10 },
        { name: "mary", count: 2 },
        { name: "steve", count: 4 }
    ], function (err, records) {
        assert.ifError(err)
        assert.equal(records.length, 5)

        temp.mapReduce(function map() {
            emit(this.name, this.count)
        }, function reduce(key, values) {
            return values.reduce(function (a, b) {
                return a + b
            }, 0)
        }, { out: { inline: 1 } }, function (err, results) {
            assert.ifError(err)
            assert.deepEqual(results, [
                { _id: "bob", value: 3 },
                { _id: "mary", value: 12 },
                { _id: "steve", value: 9}
            ])

            assert.end()
        })
    })
})

test("can drop collection", function (assert) {
    var temp = client.collection("dropped_" + uuid())

    temp.insert([
        { name: "steve", count: 5 }
    ], function (err, records) {
        assert.ifError(err)

        assert.equal(records.length, 1)

        temp.drop(function (err) {
            assert.ifError(err)

            temp.find().toArray(function (err, records) {
                assert.ifError(err)

                assert.equal(records.length, 0)

                assert.end()
            })
        })
    })
})

test("close mongo", function (assert) {
    client.close(function (err) {
        assert.ifError(err)

        assert.end()
    })
})
