define(function(require, exports, module) {
    var User = require('models/User');

    describe('User Model Test', function() {
        it('foo method', function() {
            var user = new User();
            var fooReturn = user.myMethod();
            expect(fooReturn).toEqual("foo");
        });
    });
});