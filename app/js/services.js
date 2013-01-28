'use strict';

/* Services */

angular.module('myApp.services', ['ngResource']).
    value('version', '0.0.1').
    //better use your own client-id. Get here: http://instagram.com/developer/clients/manage/
    value('instagramClintId', '39a6f9437c464ef684d543880969764d').

    factory('BestOfImages', function($resource){
        return $resource('https://api.instagram.com/v1/media/popular?client_id=:clientId&callback=JSON_CALLBACK', {}, {
            query: {method:'JSONP'}
        });
    });