define(function(require, exports, module) {
    var user = function(opts) {
        this.options = opts;
    };

    user.prototype.myMethod = function() {
        return "foo";
    };

    module.exports = user;
});