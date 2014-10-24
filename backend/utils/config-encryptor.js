var crypto = require('crypto'),
    fs = require('fs');

var Encryptor = {};
var versionFileProcessed = false;
var ENCRYPTION_KEY = "All your base are belong to us";


var addSaltToKey = function(version) {
    /* istanbul ignore next */
    if (version) {
        ENCRYPTION_KEY = ENCRYPTION_KEY + version;
        versionFileProcessed = true;
    } else {
        throw new Error('No version provided');
    }
};

Encryptor.encryptFile = function(inputPath, outputPath, version, callback) {
    /* istanbul ignore next */
    if (!versionFileProcessed) {
        addSaltToKey(version);
    }

    var options = Encryptor.defaultOptions;
    var keyBuf = new Buffer(ENCRYPTION_KEY);

    var inputStream = fs.createReadStream(inputPath);
    var outputStream = fs.createWriteStream(outputPath);
    var cipher = crypto.createCipher(options.algorithm, keyBuf);

    inputStream.on('data', function(data) {
        var buf = new Buffer(cipher.update(data), 'binary');
        outputStream.write(buf);
    });

    inputStream.on('end', function() {
        var buf = new Buffer(cipher.final('binary'), 'binary');
        outputStream.write(buf);
        outputStream.end();
        outputStream.on('close', function() {
            callback();
        });
    });
};

Encryptor.decryptFile = function(inputPath, callback, versionOverride) {
    /* istanbul ignore next */
    if (!versionFileProcessed) {
        var version;
        if (versionOverride) {
            version = versionOverride.version;
        } else {
            try {
                var versionObject = JSON.parse(fs.readFileSync('frontend/version.json'));
                version = versionObject.version;
            } catch (err) {
                throw new Error('cannot read version file');
            }
        }
        addSaltToKey(version);
    }

    var options = Encryptor.defaultOptions;

// ANDREI: SYNC VERSION
    var cipher=crypto.createDecipher(options.algorithm, ENCRYPTION_KEY),
        cipherText= fs.readFileSync(inputPath),
        dec = cipher.update(cipherText, 'binary');

    dec += cipher.final('binary');
    callback && callback(dec);


// ANDREI: ASYNC version with streams just in case...
//    var outputPath = inputPath.replace('.json', '-decrypted.json');

//    var keyBuf = new Buffer(ENCRYPTION_KEY);
//
//    var inputStream = fs.createReadStream(inputPath);
//    var outputStream = fs.createWriteStream(outputPath);
//    var cipher = crypto.createDecipher(options.algorithm, keyBuf);
//
//    inputStream.on('data', function(data) {
//        var buf = new Buffer(cipher.update(data), 'binary');
//        outputStream.write(buf);
//    });

//    inputStream.on('end', function() {
//        var buf = new Buffer(cipher.final('binary'), 'binary');
//        outputStream.write(buf);
//        outputStream.end();
//        outputStream.on('close', function() {
//            var fileContent = fs.readFileSync(outputPath);
//            callback(fileContent);
//            fs.unlink(outputPath, function(err) {
//                if (err) {
//                    console.error('Unable to delete a file', err);
//                }
//            });
//        });
//    });
};

Encryptor.defaultOptions = {
    algorithm: 'aes192'
};

module.exports = Encryptor;

