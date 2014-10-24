var convict = require('convict');
var path = require('path');
var encryptor = require('../utils/config-encryptor');

var config = convict({
    env: {
        doc: "The applicaton environment.",
        format: ["localhost", "dev", "pit", "sit", "cit", "production"],
        default: "localhost",
        env: "NODE_ENV"
    },

    app: {
        secret: {
            doc: "Key to decrypt the session",
            format: String,
            default: ""
        },
        versionFile: {
            doc: "Path to version file",
            format: String,
            default: "version.json"
        },
        // https://www.npmjs.org/package/morgan
        logFormat: {
            doc: "Predefined Format of Morgan log",
            format: ["combined", "common", "dev", "short", "tiny", "production"],
            default: "combined"
        }
    },

    host: {
        port: {
            doc: "The port to bind.",
            format: "port",
            env: "PORT",
            default: 8080
        },
        url: {
            doc: "Application URL",
            default: "",
            format: String
        }
    },

    build: {
        minimize: {
            doc: "Serve minimized js/css to the client",
            format: Boolean,
            default: true
        }
    }
});

loadFile = function (filename) {
    if (env == "localhost") {
        config.loadFile(filename);
        config.validate();
    } else {
        /* istanbul ignore next */
        encryptor.decryptFile(filename, function (decrypted) {
            var parsed;
            try {
                parsed = JSON.parse(decrypted);
            } catch(err) {
                throw new Error('Unable to parse decrypted config. Error: ' + err);
            }
            config.load(parsed);
            config.validate();
        });
    }
};

// load environment dependent configuration
var env = config.get('env');
var configFolder = __dirname;

try {
    loadFile(path.resolve(configFolder, env + '.json'));
} catch(err) {
    console.error("Unable to load a config file. Skipping...", err);
}

module.exports = config;