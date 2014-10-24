define(function(require, exports, module) {
    var app = require("webapp"),
        sinon = require("sinon");

    describe('web app tests', function() {
        it('first test', function() {
            var a = 12;
            expect(a).toEqual(12);
        });
    });
});