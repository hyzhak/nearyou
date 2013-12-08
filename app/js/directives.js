define([
    'app/facebook/like',
    'app/ui/scrollToOnEvent',
], function(fbLike, scrollToOnEvent) {
    'use strict';
    return {
        'fbLike': fbLike,
        'scrollToOnEvent': scrollToOnEvent
    };
});