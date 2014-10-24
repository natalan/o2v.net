var config = require("../config/"),
    _ = require("underscore"),
    Promise = require("bluebird"),
    fs = require("fs"),
    prettyMs = require("pretty-ms");

var readFile = Promise.promisify(fs.readFile);

/**
 *  GET home page.
 */
var getRoot = function(req, res) {
    var cnfg = _.chain(config.get()).reduce(function(memo, value, key, list) {
        memo.push({
            key: key,
            value: JSON.stringify(value)
        });
        return memo;
    }, []).value();

    res.render("index", {
        title: "Andrei Zharov :: Personal site",
        config: cnfg,
        minimize: config.get("build.minimize"),
        env: config.get('env')
    });
};

/**
 *  GET version info.
 */
var getVersion = function(req, res) {
    var dynamicData = {
        "instance run env": config.get("env"),
        "instance uptime": prettyMs(process.uptime())
    };

    /* istanbul ignore next */
    return readFile(config.get("app.versionFile"), "utf8").then(function(data) {
        res.json(_.extend(JSON.parse(data.toString("utf8")), dynamicData));
    }).catch(function(err) {
        console.error(err);
        res.json(dynamicData);
    });
};

/**
 *  GET health status.
 */
var getHealth = function(req, res) {
    res.json({ status: 'ok' });
};

exports.getRoot = getRoot;
exports.getVersion = getVersion;
exports.getHealth = getHealth;