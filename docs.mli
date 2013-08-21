type Client := {
    (Callback<mongodb/Db>) => void,
    close: Continuable<void>,
    collection: (name: String) => Collection
}

type Collection := {
    (Callback<mongodb/Collection>) => void,
    find: (selector: Object, options: Object?) => Cursor,
    findById: (id: String, options: Object?) => Continuable<Value>,
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
        => Continuable<Number>,
    drop: () => Continuable<void>
}

type Cursor := {
    (Callback<mongodb/Cursor>) => void,
    toArray: () => Continuable<Array<Value>>,
    nextObject: () => Continuable<Value | null>,
    stream: () => Stream
}

continuable-mongo/cursor := (Collection) =>
    (selector: Object, options: Object?) => Cursor

continuable-mongo/collection := (Client) => (name: String) => Collection

continuable-mongo := (uri: String, options: Object?) => Client
