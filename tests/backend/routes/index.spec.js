"use strict";
var expectRequire = require('a').expectRequire,
    _ = require('underscore'),
    sinon = require('sinon'),
    assert = require("assert"),
    deleteModuleFromCache = require('../testUtils').deleteModuleFromCache;


var request = {},
    response = {
        json: function() {},
        render: function() {}
    };

var indexRouter;

describe("INDEX API", function(){
    var stubJSON,
        stubRender;
    beforeEach(function () {
        // Reset all mocks
        expectRequire.reset();
        deleteModuleFromCache("backend/routes/index");
        indexRouter = require("../../../backend/routes/index");
        stubJSON = sinon.stub(response, "json");
        stubRender = sinon.stub(response, "render");
    });

    afterEach(function () {
        stubJSON.restore();
        stubRender.restore();
        response.body = null;
        response.statusCode = null;
    });

    it("should return version", function(done){
        indexRouter.getVersion(request, response).then(function() {
            assert.ok(stubJSON.called);
            done();
        });
    });

    it("renders page with title on root", function() {
        indexRouter.getRoot(request, response);
        assert.ok(stubRender.called);
    });

    it("responds on health pings", function() {
        indexRouter.getHealth(request, response);
        assert.ok(stubJSON.calledWith({ status: 'ok' }));
    });
});
