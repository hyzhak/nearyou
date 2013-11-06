define([
    'app/instagram/bestImages',
    'app/instagram/localImages',
], function(BestOfImages, LocalImages) {
    'use strict';
    return {
        'BestOfImages': BestOfImages,
        'LocalImages': LocalImages
    };
});