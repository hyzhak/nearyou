define([], function() {
    'use strict';
    var factory = function($resource){
        //https://developer.foursquare.com/docs/venues/search
        return $resource(
            'https://api.foursquare.com/v2/venues/search' +
                '?sw=:sw' +
                '&ne=:ne' +
                '&intent=browse' +
                '&limit=:limit' +
//                '&categoryId=:categories' +
                '&client_id=:clientId' +
                '&client_secret=:clientSecret' +
                '&v=:apiVersion', {
                    limit: 50
                }
            );
    };
    factory.$inject = ['$resource'];
    return factory;
});