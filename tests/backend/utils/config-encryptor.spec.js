"use strict";
var expectRequire = require('a').expectRequire,
    _ = require('underscore'),
    sinon = require('sinon'),
    assert = require("assert"),
    fs = require("fs"),
    path = require("path"),
    deleteModuleFromCache = require('../testUtils').deleteModuleFromCache;


var configEncryptor;

describe("Config Encryptor", function(){
    beforeEach(function () {
        // Reset all mocks
        expectRequire.reset();
        configEncryptor = require("../../../backend/utils/config-encryptor.js");
    });

    afterEach(function () {
        deleteModuleFromCache("backend/utils/config-encryptor.js");
    });

    it("uses aes192 for crypt operations", function() {
        assert.equal(configEncryptor.defaultOptions.algorithm, "aes192");
    });

    describe("encryption/decryption", function() {
        var configFile = path.resolve(__dirname, "config.json"),
            configFile_encrypted = path.resolve(__dirname, "config_encrypted.json"),
            data = {
                "foo": "bar",
                "boolean": true,
                "number": 12,
                "nested": {
                    "foo": "bar"
                }
            },
            version = 666;

        after(function() {
            fs.unlinkSync(configFile);
            fs.unlinkSync(configFile_encrypted);
        });

        fs.writeFileSync(configFile, JSON.stringify(data));

        it ("encrypts files", function(done) {
            // create file
            configEncryptor.encryptFile(configFile, configFile_encrypted, version, function() {
                done();
            });
        });

        it("decrypts files", function(done) {
            configEncryptor.decryptFile(configFile_encrypted, function(decrypted) {
                assert.deepEqual(JSON.parse(decrypted), data);
                done();
            }, {
                version: version
            });
        });

        it("throws error if no version provided for decryption", function() {
            assert.throws(function() {
                configEncryptor.decryptFile(configFile_encrypted, function(){});
            }, Error);
        });
    });
});
