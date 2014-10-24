define(function(require, exports, module) {
    var utils = {};

    utils.walk = function(obj, path) {
        if (path) {
            var ar = path.split('.');
            while (ar.length) {
                var k = ar.shift();
                if (k in obj) {
                    obj = obj[k];
                } else {
                    throw new Error("cannot find configuration param '" + path + "'");
                }
            }
        }

        return obj;
    };

    module.exports = utils;
});