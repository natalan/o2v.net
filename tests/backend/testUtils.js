exports.deleteModuleFromCache = function (modulePath){
    'use strict';

    try {
        modulePath = modulePath.replace(/\.\.\//g, '');
        Object.keys(require.cache).filter(function (module){
            return module.indexOf(modulePath) >= 0;
        }).map(function (module){
            delete require.cache[module];
        });
    } catch (err) {
    }
};