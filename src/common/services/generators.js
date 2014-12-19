/**
 * A generator for iterating over the key/value pairs in an object.
 *
 * @param {object} obj The object that will be iterated over for it's key/value
 *  pairs.
 */
function* entries(obj) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}

/**
 * A generator for iterating over the keys in an object.
 *
 * @param {object} obj The object that will be iterated over for it's keys.
 */
function* keys(obj) {
    for (let key of Object.keys(obj)) {
        yield key;
    }
}

/**
 * A generator that yields the first n values of an iterator.
 *
 * @param {generator} iterator Generator to iterate over.
 * @param {int} n Number of values to iterate over in the generator.
 */
function* take(iterator, n) {
    while (n > 0) {
        yield iterator.next();
        n--;
    }
}

/**
 * A generator that yields the first n values of an iterator.
 *
 * @param {object} obj The object that will be iterated over for it's values.
 */
function* values(obj) {
    for (let key of Object.keys(obj)) {
        yield obj[key];
    }
}

export {entries, keys, take, values};
