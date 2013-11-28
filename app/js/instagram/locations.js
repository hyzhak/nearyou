define([], function() {
    'use strict';
    var factory = function($resource){
        //http://instagram.com/developer/endpoints/locations/
        return $resource('https://api.instagram.com/v1/locations/search?' +
            'lat=:lat&' +
            'lng=:lng&' +
            'distance=:distance&' +
            'client_id=:clientId&' +
            'callback=JSON_CALLBACK',
            {
                'distance': 5000
            },
            {
                query: {method:'JSONP'}
            });
    };
    factory.$inject = ['$resource'];
    return factory;
});