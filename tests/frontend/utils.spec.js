define(function(require) {
    describe("config test", function() {
        var utils = require("utils"),
            sinon = require("sinon");

        it("walk method works", function() {
            var walk = utils.walk;
            var obj = {
                "firstLevel": 1,
                foo: {
                    bar: 2,
                    rar: [1,2,3],
                    bool: true,
                    string: "test",
                    third: {
                        "4": "works!"
                    }
                }
            };

            expect(walk(obj, "firstLevel")).toEqual(1);
            expect(walk(obj, "foo")).toEqual(obj.foo);
            expect(walk(obj, "foo.bar")).toEqual(2);
            expect(walk(obj, "foo.rar")).toEqual([1,2,3]);
            expect(walk(obj, "foo.bool")).toEqual(true);
            expect(walk(obj, "foo.string")).toEqual("test");
            expect(walk(obj, "foo.third.4")).toEqual("works!");

            var notExistingPath = "foo.path.doesnt.exist";
            expect(function() {walk(obj, notExistingPath)}).toThrow("cannot find configuration param '" + notExistingPath + "'");
            expect(walk(obj)).toEqual(obj);
        });
    });
});