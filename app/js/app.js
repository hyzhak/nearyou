'use strict';

// Declare app level module which depends on filters, and services
var module = angular.module('myApp', ['myApp.services', 'ngRoute']).
    //better use your own client-id. Get here: http://instagram.com/developer/clients/manage/
    value('instagramClintId', '39a6f9437c464ef684d543880969764d').
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/bestof', {templateUrl: 'partials/bestofinstagram.html', controller: BestOfInstagramCtrl});
        $routeProvider.when('/local', {templateUrl: 'partials/bestofinstagram.html', controller: RequestUserLocationCtrl});
        $routeProvider.when('/local/:lat/:lng', {templateUrl: 'partials/bestofinstagram.html', controller: LocalInstagramCtrl});
        $routeProvider.otherwise({redirectTo: '/local'});
    }]);

module.service('SearchState', function(){
    var state = "";
    return {
        getState : function(){
            return state;
        },
        setState: function(value){
            console.log('set State of SearchState');
            state = value;
        }
    }
});

module.controller('MainCtrl', ['$scope', 'SearchState', function($scope, SearchState){
    $scope.year = 2013;
    $scope.isActivate = function(state){
        if(SearchState.getState() == state){
            return 'active';
        }else{
            return '';
        }
    };

    $scope.lockScroll = false;

    /*
    $scope.$watch('lockScroll', function(newValue, oldValue){
        console.log('newValue', newValue);
        console.log('oldValue', oldValue);
    });
    */

    $scope.isTrue = function(condition, trueExpression, falseExpression){
        return condition?trueExpression:falseExpression;
    };

    $scope.showAbout = function(){
        $('#aboutWindow').modal('show');
        trackPage('show-about');
    };

    $scope.hideAbout = function(){
        $('#aboutWindow').modal('hide');
        trackPage('hide-about');
    };

    $('#aboutWindow').on('show', function (e) {
        $scope.lockScroll = true;
        trackPage('on-show-about');
        //break
        //$scope.$digest();
    });

    $('#aboutWindow').on('hidden', function (e) {
        trackPage('on-hidden-about');
        $scope.$apply(function(){
            $scope.lockScroll = false;
        });
    });
}]);