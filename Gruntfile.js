var _ = require("underscore"),
    path = require("path"),
    exec = require("child_process").exec,
    encryptor = require("./backend/utils/config-encryptor"),
    Promise = require("bluebird"),
    fs = require("fs"),
    fsTools = require("fs-tools");

module.exports = function(grunt) {
    var _pkg = grunt.file.readJSON("package.json");

    var defaults = {
        "env": {
            "doc": "Build run environment",
            "enum": ["localhost", "dev", "pit", "sit", "cit", "production"],
            "default": "localhost"
        },
        "build": {
            "doc": "Build version",
            "default": 0
        },
        "TMP_FOLDER": {
            "doc": "Temporary folder to manipulate with app files",
            "default": "dist/tmp/"
        },
        "BUILD_FOLDER": {
            "doc": "Final destination of a build",
            "default": "dist/web/"
        },
        "instrumentationFilePath": {
            "doc": "Location of instrumentation file",
            "default": "tests/backend/instrumentation.spec.js"
        }
    };

    var getOptionOrDefault = function(name) {
        if (grunt.option(name) != null) {
            var value = grunt.option(name);
            if (defaults[name] && defaults[name]["enum"] && !_(defaults[name]["enum"]).contains(value)) {
                grunt.fail.fatal("Value is not supported");
            }
            return value.toString().replace(/\/$/, "");
        } else {
            if (defaults[name] == null) {
                grunt.fail.fatal("Option does not exist in defaults");
            }
            return defaults[name]["default"];
        }
    };

    var makeVersion = function(buildNumber) {
        var versionParts = _pkg.version.split(".");
        return [versionParts[0], versionParts[1], buildNumber].join(".");
    };


    // build files and folders
    var TMP_FOLDER = getOptionOrDefault("TMP_FOLDER"),
        BUILD_FOLDER = getOptionOrDefault("BUILD_FOLDER");

    grunt.initConfig({
        pkg: _pkg,
        env: getOptionOrDefault("env"),
        version: makeVersion(getOptionOrDefault("build")),

        nodemon: {
            options: {
                nodeArgs: ["--debug"],
                env: {
                    NODE_ENV: "localhost"
                },
                callback: function (nodemon) {
                    nodemon.on("log", function (event) {
                        console.log(event.colour);
                    });

                    // opens browser on initial server start
                    nodemon.on("config:update", function () {
                        // Delay before server listens on port
                        setTimeout(function() {
                            require("open")("http://localhost:3000");
                        }, 1000);
                    });
                }
            },
            localhost: {
                script: "bin/www",
                options: {
                    nodeArgs: ["--debug"],
                    env: {
                        NODE_ENV: "localhost"
                    }
                }
            },
            dev: {
                script: "bin/www",
                options: {
                    nodeArgs: [],
                    env: {
                        NODE_ENV: "dev"
                    }
                }
            },
            prod: {
                script: "bin/www",
                options: {
                    nodeArgs: [],
                    env: {
                        NODE_ENV: "production"
                    }
                }
            }
        },

        requirejs: {
            app: {
                options: {
                    logLevel: 1,
                    baseUrl: TMP_FOLDER + "frontend/javascripts",
                    mainConfigFile: TMP_FOLDER + "frontend/javascripts/init.js",
                    out: TMP_FOLDER + "frontend/javascripts.min.js",
                    name: "init",
                    optimize: "none",
                    done: function (done, output) {
                        done();
                    },
                    include: ["libs/requirejs/require.js"]
                }
            },
            heroku: {
                options: {
                    logLevel: 1,
                    baseUrl: "frontend/javascripts",
                    mainConfigFile: "frontend/javascripts/init.js",
                    out: "frontend/javascripts.min.js",
                    name: "init",
                    optimize: "uglify2",
                    done: function (done, output) {
                        done();
                    },
                    include: ["libs/requirejs/require.js"]
                }
            }
        },

        "bower-install-simple": {
            options: {
                color: true,
                directory: TMP_FOLDER + "frontend/javascripts/libs"
            },
            "prod": {
                options: {
                    production: true,
                    directory: "frontend/javascripts/libs"
                }
            },
            "dev": {
                options: {
                    production: false
                }
            },
            "localhost": {
                options: {
                    production: false,
                    directory: "frontend/javascripts/libs"
                }
            }
        },

        less: {
            app: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: [
                    { src: TMP_FOLDER + "frontend/stylesheets/main.less", dest: TMP_FOLDER + "frontend/stylesheets.min.css"}
                ]
            },
            heroku: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: [
                    { src: "frontend/stylesheets/main.less", dest: "frontend/stylesheets.min.css"}
                ]
            }
        },

        replace: {
            css: {
                files: [{
                    src: TMP_FOLDER + "frontend/<%= pkg.name %>.min.css",
                    dest: TMP_FOLDER + "frontend/<%= pkg.name %>.min.css"
                }],
                options: {
                    usePrefix: false,
                    patterns: [{
                        match: /\/(\bfonts\b|\bimages\b)/g,
                        replacement: "./$1"
                    }]
                }
            },
            js: {
                files: [{
                    src: TMP_FOLDER + "frontend/<%= pkg.name %>.min.js",
                    dest: TMP_FOLDER + "frontend/<%= pkg.name %>.min.js"
                }],
                options: {
                    usePrefix: false,
                    patterns: [{
                        match: /\/(\bjavascripts\b)/g,
                        replacement: "./$1"
                    }]
                }
            }
        },

        clean: {
            temp: {
                src: [ TMP_FOLDER ]
            },
            result: {
                src: [ BUILD_FOLDER ]
            }
        },

        copy: {
            temp: {
                src: ["**/*", "!**/node_modules/**", "!Gruntfile.js", "!.gitignore", "!**/libs/**"],
                dest: TMP_FOLDER
            },
            result: {
                files: [{
                    expand: true,
                    cwd: TMP_FOLDER,
                    src: ["**/*", "!**/stylesheets/**", "!**/javascripts/**", "!**/dist/**"],
                    dest: BUILD_FOLDER
                }]
            }
        },

        plato: {
            default: {
                files: {
                    "tests/results/complexity": ["frontend/javascripts/**/*.js", "!**/libs/**"]
                }
            }
        },

        mochaTest: {
            backendTest: {
                options: {
                    reporter: "spec"
                },
                src: ["tests/backend/**/*.spec.js"]
            },
            backendQa: {
                options: {
                    reporter: "spec",
                    captureFile: "tests/results/backend.txt",
                    quiet: true,
                    colors: false
                },
                src: ["tests/backend/**/*.spec.js"]
            },
            backendJenkins: {
                options: {
                    reporter: "tap",
                    quiet: false,
                    colors: false,
                    captureFile: "tests/results/backend.tap"
                },
                src: ["tests/backend/**/*.spec.js"]
            }
        },

        karma: {
            options: {
                configFile: "tests/frontend/karma.conf.js"
            },
            unit: {
                reporters: ["progress", "coverage"],
                coverageReporter: {
                    reporters:[
                        {type: "text-summary", dir: "tests/results/frontend_coverage/", file: "../coverage.txt"},
                        {type: "html", dir: "tests/results/frontend_coverage/pretty"}
                    ]
                }
            },
            browsers: {
                browsers: ["PhantomJS", "Chrome", "Firefox", "Safari"]
            },
            jenkins: {
                reporters: ["spec", "coverage", "junit"],
                colors: false,
                logLevel: "DEBUG",
                loggers: [{
                    type: "file",
                    filename: "karma-unit.log"
                }],
                coverageReporter: {
                    reporters:[
                        {type: "cobertura", dir: "tests/results/frontend_coverage/"},
                        {type: "html", dir: "tests/results/frontend_coverage/pretty"}
                    ]
                }
            }
        },
        exec: {
            coverageFrontend: {
                command: "node build/coverage-frontend.js frontend"
            },
            coverageBackendCheck: {
                command: "build/coverage-backend.sh check"
            },
            installProdNPM: {
                command: "cd "+ TMP_FOLDER + "; npm install --production"
            }
        },

        mochaSelenium: {
            options: {
                // Mocha options
                reporter: "spec",
                timeout: 30e3,
                // Toggles wd"s promises API, default:false
                usePromises: true
            },
            phantomjs: {
                src: ["tests/e2e/**/*.spec.js"],
                options: {
                    browserName: "phantomjs"
                }
            },
            chrome: {
                src: ["tests/e2e/**/*.spec.js"],
                options: {
                    browserName: "chrome"
                }
            }
        },

        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            acceptanceJenkins: {
                tasks: ["forever:server1:stop", "forever:server1:start", "mochaSelenium:phantomjs"]
            },
            acceptance: {
                tasks: ["forever:server1:stop", "forever:server1:start", "mochaSelenium"]
            }
        },

        forever: {
            server1: {
                options: {
                    index: "bin/www",
                    logDir: "logs"
                }
            }
        }
    });

    /**
     * Load grunt tasks
     */
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-replace");
    grunt.loadNpmTasks("grunt-nodemon");
    grunt.loadNpmTasks("grunt-bower-install-simple");
    grunt.loadNpmTasks("grunt-plato");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-mocha-selenium");
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-forever");

    /**
     * Help tasks
     */

    // http://shared-mind.tumblr.com/post/89641439478/istanbul-code-coverage-force-instrumentation-of-all-file
    grunt.registerTask("gen-instrumentation-file", function() {
        var instrumentationFilePath = getOptionOrDefault("instrumentationFilePath");

        if(fs.existsSync(instrumentationFilePath)){
            // remove file if exists
            fs.unlinkSync(instrumentationFilePath);
        }

        // use {"flags": "a"} to append and {"flags": "w"} to erase and write a new file
        var file = fs.createWriteStream(instrumentationFilePath, {"flags": "a"});
        grunt.log.writeln("generating instrumentation file: %s", instrumentationFilePath);

        fsTools.walkSync("./backend", ".js$", function(path){
            var isTemplate = path.indexOf(".hjs") !== -1;
            if (isTemplate) {
                return;
            }
            grunt.log.writeln("require file ./%s", path);
            file.write("require(\"../../" + path + "\");\n");
        });

        grunt.log.ok("generated %s", instrumentationFilePath);
    });

    grunt.registerTask("version", "add version file", function () {
        grunt.log.ok(["Writing version"]);
        grunt.file.write(BUILD_FOLDER + "frontend/version.json", JSON.stringify({
            version: grunt.config("version"),
            package_environment: grunt.config("env"),
            date: grunt.template.today()
        }));
    });


    grunt.registerTask("encryptConfigs", "Encrypting config files", function() {
        var done = this.async();

        Promise.all(fs.readdirSync(path.resolve(TMP_FOLDER + "backend/config")).map(function(file) {
            // do not encrypt index file
            if (file.indexOf("index.js") != -1) {
                return Promise.resolve();
            }

            var resolver = Promise.defer(),
                fileFrom = path.resolve(TMP_FOLDER + "backend/config/" + file),
                fileTo = path.resolve(TMP_FOLDER + "backend/config/" + "encrypted-" + file);

            encryptor.encryptFile(fileFrom, fileTo, grunt.config("version"), function(err) {
                if (err) {
                    grunt.util.error("Unable to encrypt", err);
                    resolver.reject(err);
                } else {
                    fs.unlink(fileFrom, function(err) {
                        if (err) {
                            grunt.util.error("Unable to delete a file", err);
                            resolver.reject(err);
                        }
                        fs.rename(fileTo, fileFrom, function(err) {
                            if ( err ) {
                                console.log("ERROR renaming a file: " + err);
                                resolver.reject(err);
                            } else {
                                resolver.resolve();
                            }
                        });
                    });
                }
            });

            return resolver.promise;
        })).then(done).catch(function(err) {
            grunt.util.error("Unable to encrypt", err);
        });

    });

    grunt.registerTask("done", "Show build info", function() {
        grunt.log.ok(["Build version: " + grunt.config("version")]);
        grunt.log.ok(["Build timestamp: " + grunt.template.today()]);
    });


    /**
     * TESTS aliases
     */

    grunt.registerTask("tests:complexity", ["plato"]);

    grunt.registerTask("tests:acceptance", ["concurrent:acceptance", "forever:server1:stop"]);
    grunt.registerTask("tests:acceptance-jenkins", ["concurrent:acceptanceJenkins", "forever:server1:stop"]);

    grunt.registerTask("tests:frontend", ["karma:unit", "exec:coverageFrontend", "tests:acceptance"]);
    grunt.registerTask("tests:frontend-jenkins", ["karma:jenkins", "tests:acceptance-jenkins"]);

    grunt.registerTask("tests:backend", ["gen-instrumentation-file", "mochaTest:backendTest", "exec:coverageBackendCheck"]);
    grunt.registerTask("tests:backend-jenkins", ["gen-instrumentation-file", "mochaTest:backendJenkins", "exec:coverageBackendCheck"]);

    grunt.registerTask("tests", ["tests:frontend", "tests:backend", "tests:complexity"]);
    grunt.registerTask("tests-jenkins", ["tests:frontend-jenkins", "tests:backend-jenkins"]);


    /**
     * Build aliases
     */
    grunt.registerTask("buildVersionFile", ["version"]);
    grunt.registerTask("buildFrontEnd", ["less:app", "requirejs:app"]);
    grunt.registerTask("buildFrontEnd-heroku", ["less:heroku", "requirejs:heroku"]);
    grunt.registerTask("makeTempFolder", ["clean:temp", "clean:result", "copy:temp", "exec:installProdNPM"]);

    grunt.registerTask("build", ["makeTempFolder", "buildFrontEnd", "buildVersionFile", "encryptConfigs", "copy:result",
        "clean:temp","clean:result", "done"]);

    grunt.registerTask("build-heroku", ["bower-install-simple:prod", "buildFrontEnd-heroku", "done"]);

    grunt.registerTask("testAndBuildJenkins", ["tests-jenkins", "build", "exec:rsync"]);


    /**
     * RUNNING SERVER aliases
     */
    grunt.registerTask("server", ["nodemon:localhost"]);
    grunt.registerTask("server:dev", ["nodemon:dev"]);
    grunt.registerTask("server:pit", ["nodemon:pit"]);
    grunt.registerTask("server:sit", ["nodemon:sit"]);
    grunt.registerTask("server:production", ["nodemon:production"]);
};
