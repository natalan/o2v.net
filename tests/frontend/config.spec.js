define(function(require) {
    describe('config test', function() {
        var config = require('config');

        it("defaults to localhost if window.env is not set", function() {
            expect(window.env).toBeUndefined();
            var defaultEnv = config.get("env");
            expect(defaultEnv).toEqual("localhost");
        });

        it("returns an object that contains api", function() {
            var api = config.get("api");
            expect(api).toEqual("http://localhost:3000/api");
        });

        it("loads config based on env variable", function() {
            ["dev", "production", "localhost"].forEach(function(value) {
                config.loadConfig(value);
                var env = config.get("env");
                expect(env).toEqual(value);
            });
        });

        it ("throws exception if trying to get an unknown path", function() {
            expect(function() {config.loadConfig("wrong")}).toThrow("Unknown environment");
        });
    });
});