define([], function() {
    'use strict';

    var directive = function($document) {
        //inject fb-script
        angular.element(document.body).append('<div id="fb-root"></div>');
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "http://connect.facebook.net/en_US/all.js#xfbml=1&appId=332380903563397";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        //inject html of button
        return {
            template: '<div class="fb-like" ' +
                           'data-href="{{href}}" ' +
                           'data-layout="{{layout}}" ' +
                           'data-action="like" ' +
                           'data-width="{{width}}" ' +
                           'data-show-faces="{{faces}}" ' +
                           'data-share="false">' +
                      '</div>',
            restrict: 'E',
            scope: {
                'faces': '@',
                'href': '@',
                'layout': '@',
                'width': '@'
            }
        };
    };

    directive.$inject = ['$document'];

    return directive;
});