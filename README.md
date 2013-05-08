# continuable-mongo

<!-- [![build status][1]][2] [![dependency status][3]][4]

[![browser support][5]][6] -->

A thin mongo wrapper which exposes mongodb as continuables

## Example

```js
var mongo = require("continuable-mongo")

var client = mongo("mongodb://localhost:27017/my_db")

var myCollection = client.collection("my-collection")

myCollection.insert([{
    some: "key",
    value: "pair"
}])(function (err, inserted) {
    // inserted records

    myCollection.findOne({
        some: "key"
    })(function (err, result) {
        // result.value === "pair"

        console.log("result", result)
    })
})
```

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
