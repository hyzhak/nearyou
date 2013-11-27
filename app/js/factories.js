define([
    'app/instagram/bestImages',
    'app/instagram/localImages',
    'app/instagram/locations',
], function(BestOfImages, LocalImages, Locations) {
    'use strict';
    return {
        'BestOfImages': BestOfImages,
        'LocalImages': LocalImages,
        'Locations': Locations
    };
});