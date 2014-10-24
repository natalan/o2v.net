define(['underscore',
        'text!config/default.json',
        'text!config/localhost.json',
        'text!config/dev.json',
        'text!config/prd.json',
        'utils'
       ], function (_, defaultConfig, localhost, dev, prd, utils) {

    var parsed_default = JSON.parse(defaultConfig),
        parsedEnv,
        _cfg;

    function loadConfig(env) {
        var _env = env;

        if (_env == "localhost") {
            parsedEnv = JSON.parse(localhost);
        } else if (_env == "dev") {
            parsedEnv = JSON.parse(dev);
        } else if (_env == "production") {
            parsedEnv = JSON.parse(prd);
        } else {
            throw new Error("Unknown environment");
        }

        _cfg = _.extend({}, parsed_default, parsedEnv);
    };

    loadConfig(window.env || "localhost");

    return {
        get: function(path) {
            var o = utils.walk(_cfg, path);
            return JSON.parse(JSON.stringify(o));
        },
        loadConfig: loadConfig
    };
});