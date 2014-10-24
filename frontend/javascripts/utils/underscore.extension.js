define(['underscore'], function(_) {

	_.templateSettings = {
        evaluate    : /\{\[(.+?)\]\}/g,
        interpolate : /\{\{(.+?)\}\}/g,
        escape      : /{{-(.+?)}}/g,
        variable    : "data"
    };

    // Save old template function
    _._template = _.template;

    // Improve template function to store the actual template markup.
    _.template = function(text, data, settings) {
        var template = _._template(text, data, settings);
        template.text = text;

        return template;
    };

    /**
     * Allow underscore use of partials
     * https://github.com/khepin/underscore-partials/blob/master/underscore-partials.js
     */
    var partialCache = {};

    var partial = function(name, data) {
        return partialCache[name](data);
    };

    partial.declare = function(name, template, templateSettings) {
        partialCache[name] = _.template(template, undefined, templateSettings);
    };

    partial.exists = function(name) {
        return _.isFunction(partialCache[name]);
    };

    partial.remove = function(name) {
        delete partialCache[name];
    };

    // extend Underscore
    _.template.partial = partial;


    return _;
});