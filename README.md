# continuable-mongo

<!-- [![build status][1]][2] [![dependency status][3]][4]

[![browser support][5]][6] -->

A thin mongo wrapper which exposes mongodb as continuables

## Example

For now you can pass either a callback to each collection method
  or not pass in a callback and the function returns a continuable

```js
var mongo = require("continuable-mongo")

var client = mongo("mongodb://localhost:27017/my_db")

var myCollection = client.collection("my-collection")

myCollection.insert([{
    some: "key",
    value: "pair"
}], function (err, inserted) {
    // inserted records

    myCollection.findOne({
        some: "key"
    }, function (err, result) {
        // result.value === "pair"

        console.log("result", result)
    })
})
```

## Differences from mongodb/Collection

### `Collection#findById`

a collection object returned by `client.collection` has an
    additional `.findById(id)` method. This is used to find
    a record by it's mongodb _id. It's assumed that id is a string
    or otherwise valid argument to `ObjectID` and that the _id field
    on the mongodb record is a `ObjectID`

The purpose of this method is not have to manually require `ObjectID`
    to avoid littering your code base to mongodb internal references.

If you do need access to the raw ObjectID function there is a safer
    variant that can be required `"continuable-mongo/object-id"` which
    either returns a mongodb/ObjectID instance or will return an `Error`.
    Which means it's a function which will not throw but does need
    checking on the returned value.


## Installation

`npm install continuable-mongo`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Colingo/continuable-mongo.png
  [2]: http://travis-ci.org/Colingo/continuable-mongo
  [3]: https://david-dm.org/Colingo/continuable-mongo/status.png
  [4]: https://david-dm.org/Colingo/continuable-mongo
  [5]: https://ci.testling.com/Colingo/continuable-mongo.png
  [6]: https://ci.testling.com/Colingo/continuable-mongo
