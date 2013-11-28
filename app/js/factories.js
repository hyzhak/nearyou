define([
    'app/foursquare/venues',
    'app/instagram/bestImages',
    'app/instagram/localImages',
    'app/instagram/locations',
], function(Venues, BestOfImages, LocalImages, Locations) {
    'use strict';
    return {
        'FourSquareVenues': Venues,
        'BestOfImages': BestOfImages,
        'LocalImages': LocalImages,
        'Locations': Locations
    };
});