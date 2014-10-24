define(function(require, exports, module) {
    var $ = require("jquery");

    var Webapp = function() {
        this.bindEvents = function() {
            $(".portfolio").on("click", ".zoom-effect", function() {
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