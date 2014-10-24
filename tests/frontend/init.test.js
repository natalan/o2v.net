// Karma includes all the files in window.__karma__.files, so by filtering this array we find all our test files
var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return /\.spec\.js$/.test(file) && /tests\/frontend/.test(file);
});

console.log("Found test files:", tests);

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/frontend/javascripts',

    paths : {
        templates: "../templates",
        config: "config",
        jquery: "libs/jquery/dist/jquery",
        text: "libs/text/text",
        underscore: "libs/underscore/underscore",
        sinon: "libs/sinon/lib/sinon"
    },

    shim: {
        'underscore': {
            exports: '_'
        },
        config: {
            deps: ['underscore'],
            exports : 'config'
        }
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
