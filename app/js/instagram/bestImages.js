define([], function() {
    'use strict';
    var factory = function($resource){
        return $resource('https://api.instagram.com/v1/media/popular?client_id=:clientId&callback=JSON_CALLBACK', {}, {
            query: {method:'JSONP'}
        });
    };
    factory.$inject = ['$resource'];
    return factory;
});