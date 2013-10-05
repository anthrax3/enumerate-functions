/**
    # Enumerate Functions

    This library allows converting functions to JSON or strings.

    It works by enumerating the bounded domain, serializing each value
    and then applying the function to obtain a value in the codomain,
    which it also serializes:

        var ef = require('enumerate-functions');

        function not(b) {
            return !b;
        }
        not.toString = not.inspect = ef.deriveToString(ef.dictionaries.Boolean, ef.dictionaries.Boolean, not);

        console.log(not);
        // [{"domain":false,"codomain":true},{"domain":true,"codomain":false}]
**/

/**
    ## dictionaries.Boolean

    A serializer and enumerate for Boolean. Enumeration produces:

    * true
    * false

    ## dictionaries.Number

    A serializer for Number.

    ## dictionaries.String

    A serializer for String.
**/
var dictionaries = {
    Boolean: {
        enumerate: function() {
            return [false, true];
        },
        toJSON: identity
    },
    Number: {
        toJSON: identity
    },
    String: {
        toJSON: identity
    }
};

function identity(x) {
    return x;
}

/**
    ## toJSON :: forall a b. ( { toJSON: a -> Object, enumerate: () -> [a] }, { toJSON: b -> Object }, a -> b ) -> Object

    Converts a function to JSON.
**/
function toJSON(domainEnumerator, codomainSerializer, f) {
    var domainValues = domainEnumerator.enumerate(),
        results = [],
        i;

    for(i = 0; i < domainValues.length; i++) {
        results.push({
            domain: domainEnumerator.toJSON(domainValues[i]),
            codomain: codomainSerializer.toJSON(f(domainValues[i]))
        });
    }

    return results;
}

/**
    ## toJSON :: forall a b. ( { toJSON: a -> Object, enumerate: () -> [a] }, { toJSON: b -> Object }, a -> b ) -> () -> String

    Creates a `toString` or `inspect` function for a given function.
**/
function deriveToString(domainEnumerator, codomainSerializer, f) {
    return function() {
        return JSON.stringify(toJSON(domainEnumerator, codomainSerializer, f));
    };
}

if(typeof module != 'undefined') {
    module.exports = {
        toJSON: toJSON,
        deriveToString: deriveToString,
        dictionaries: dictionaries
    };
}
