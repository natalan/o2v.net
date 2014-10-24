require.config({
    baseUrl: "/javascripts",
    paths : {
        templates: "../templates",
        config: "config",
        text: "libs/text/text",
        jquery: "libs/jquery/dist/jquery",
        underscore: "libs/underscore/underscore",
        underscore_ext: "utils/underscore.extension"
    },

    map: {
        // Everyone get an extension module as if it's an original
        "*": {
            "underscore": "underscore_ext"
        },

        // Extension modules get original modules as dependencies
        "underscore_ext": { "underscore" : "underscore" }
    },

    shim : {
        jQuery : {
            exports : '$'
        },
        config: {
            deps: ["underscore"],
            exports : "config"
        },
        underscore: {
            exports: "_"
        }

    }
});

require(["webapp"], function (webapp) {
    webapp.start();
});
