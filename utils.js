
var Random = {
    /**
     * @param {Number} min  The smallest returned value
     * @param {Number} max  The largest returned value
     */
    'range': function (min, max) {
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    },

    /**
     * @param {Array} array  The array of elements to return random element from
     */
    'element': function (collection) {
        if (collection.constructor == Object) {
            var keys = Object.keys(collection);
            return collection[this.element(keys)];
        }
        if (collection.constructor == Array) {
            return collection[this.range(0, collection.length - 1)];
        }
        console.log("Warning @ Random.element: "+ collection + " is neither Array or Object");
        return null;
    }
};

/**
 * Makes a deep copy of an object. Note that this will not make deep copies of
 * objects with prototypes.
 */
function copy(object) {
    if (object.constructor == Array) {
        return jQuery.extend(true, [], object);
    }
    return jQuery.extend(true, {}, object);
}

function properCase(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
}

/**
 * @param {Object} data
 */
function objectToInstance(data) {
    var instance = eval("new " + data.classType + "()");
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            instance[i] = data[i];
        }
    }
    return instance;
}