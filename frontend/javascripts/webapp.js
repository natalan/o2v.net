define(function(require, exports, module) {
    var config = require('config'),
        _ = require("underscore"),
        $ = require("jquery");

    var Webapp = function() {
        this.bindEvents = function() {
            $(".portfolio").on("click", ".zoom-effect", function(e) {
                var link = $(this).find("a.view").attr("href");
                window.open(link);
            });
        };

        this.start = function() {
            this.bindEvents();
        };
    };

    module.exports = new Webapp;
});