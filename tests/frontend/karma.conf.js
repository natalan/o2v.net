"use strict";

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: "../..",

        frameworks: ["jasmine", "requirejs"],

        // list of files / patterns to load in the browser
        files: [
            // Which files do you want to test?
            {pattern: "frontend/javascripts/**/*", included: false},
            {pattern: "frontend/templates/**/*.html", included: false},
            {pattern: "tests/frontend/**/*.spec.js", included: false},
            "tests/frontend/init.test.js"
            // TODO: ANDREI: add mocks?
        ],
        exclude: [
            "frontend/javascripts/init.js"
        ],

        // use dots reporter, as travis terminal does not support escaping sequences
        // possible values: "dots", "progress"
        // CLI --reporters progress
        reporters: ["progress", "junit", "coverage"],

        preprocessors: {
            "{frontend/javascripts,frontend/javascripts/!(libs)/**}/!(*.test).js": ["coverage"]
        },

        junitReporter: {
            // will be resolved to basePath (in the same way as files/exclude patterns)
            outputFile: "tests/results/frontend/jasmine-test-results.xml"
        },

        coverageReporter: {
            type: "html",
            dir: "tests/results/frontend_coverage/"
        },

        // enable / disable colors in the output (reporters and logs)
        // CLI --colors --no-colors
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        // CLI --log-level debug
        logLevel: config.LOG_DEBUG,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        // CLI --browsers Chrome,Firefox,Safari
        browsers: ["PhantomJS"],
        browserNoActivityTimeout: 120000, // Needed by slower machines

        // Auto run tests on start (when browsers are captured) and exit
        // CLI --single-run --no-single-run
        singleRun: true,

        // report which specs are slower than 500ms
        // CLI --report-slower-than 500
        reportSlowerThan: 500,

        // web server port
        port: 9876,

        plugins: [
            "karma-jasmine",
            "karma-requirejs",
            "karma-coverage",
            "karma-phantomjs-launcher",
            "karma-chrome-launcher",
            "karma-firefox-launcher",
            "karma-safari-launcher",
            "karma-junit-reporter",
            "karma-html-reporter",
            "karma-spec-reporter"
        ]
    });
};