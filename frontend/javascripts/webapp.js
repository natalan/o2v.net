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
            this.checkCVButton();
            this.bindEvents();
        };

        this.checkCVButton = function() {
            if ("print" in window) {
                var $resumeButton = $("#printResume");
                $resumeButton.on("click", function(e) {
                    window.print();
                    e.preventDefault();
                });
            } else {
                return;
            }



        };
    };

    module.exports = new Webapp;
});