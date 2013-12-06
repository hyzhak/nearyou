define([
    'app/foursquare/venues',
    'app/foursquare/search',
    'app/google/geocoding',
    'app/instagram/bestImages',
    'app/instagram/localImages',
    'app/instagram/locations',
], function(Venues, Search, GeoCoding, BestOfImages, LocalImages, Locations) {
    'use strict';
    return {
        'FourSquareVenues': Venues,
        'FourSquareSearch': Search,
        'GoogleGeoCoding': GeoCoding,
        'BestOfImages': BestOfImages,
        'LocalImages': LocalImages,
        'Locations': Locations
    };
});