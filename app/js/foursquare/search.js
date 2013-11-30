define([], function() {
    'use strict';
    var factory = function($resource){
        //https://developer.foursquare.com/docs/venues/search
        return $resource(
            'https://api.foursquare.com/v2/venues/explore' +
            '?ll=:ll' +
            '&radius=:radius' +
            '&query=:query' +
            '&limit=:limit' +
//            '&venuePhotos=:venuePhotos' +
            '&offset=:offset' +
//                '&categoryId=:categories' +
            '&client_id=:clientId' +
            '&client_secret=:clientSecret' +
            '&v=:apiVersion', {
                radius: 10000,
                limit: 50,
                offset: 0,
                venuePhotos: 1
            }
        );
    };
    factory.$inject = ['$resource'];
    return factory;
});