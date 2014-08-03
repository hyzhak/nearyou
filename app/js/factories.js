define([
    'app/foursquare/venues',
    'app/foursquare/search',
    'app/google/geocoding',
    'app/instagram/bestImages',
    'app/instagram/locations',
], function(Venues, Search, GeoCoding, BestOfImages, Locations) {
    'use strict';
    return {
        'FourSquareVenues': Venues,
        'FourSquareSearch': Search,
        'GoogleGeoCoding': GeoCoding,
        'BestOfImages': BestOfImages,
        'Locations': Locations
    };
});