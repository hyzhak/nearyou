define([], function() {
    'use strict';
    var factory = function($resource){
        return $resource('https://api.instagram.com/v1/media/search?client_id=:clientId&callback=JSON_CALLBACK&lat=:lat&lng=:lng&max_timestamp=:max_timestamp&distance=:distance',
            {distance: 5000},
            {query: {method:'JSONP'}}
        );
    };
    factory.$inject = ['$resource'];
    return factory;
});