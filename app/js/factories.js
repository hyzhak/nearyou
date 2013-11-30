define([
    'app/foursquare/venues',
    'app/foursquare/search',
    'app/instagram/bestImages',
    'app/instagram/localImages',
    'app/instagram/locations',
], function(Venues, Search, BestOfImages, LocalImages, Locations) {
    'use strict';
    return {
        'FourSquareVenues': Venues,
        'FourSquareSearch': Search,
        'BestOfImages': BestOfImages,
        'LocalImages': LocalImages,
        'Locations': Locations
    };
});