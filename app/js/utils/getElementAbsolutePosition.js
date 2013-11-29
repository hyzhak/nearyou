/**
 * get absolute position of DOM element
 *
 * @param element
 * @returns {{x: number, y: number}}
 */
define(function() {
    'use strict';
    return function(element) {
        var box = element.getBoundingClientRect(),
            x = angular.isDefined(window.pageXOffset) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
            y = angular.isDefined(window.pageYOffset) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

        return {
            x: box.left + x,
            y: box.top + y
        }
    }
});