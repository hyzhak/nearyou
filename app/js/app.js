'use strict';

// Declare app level module which depends on filters, and services
var module = angular.module('myApp', ['myApp.services']).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/bestof', {templateUrl: 'partials/bestofinstagram.html', controller: BestOfInstagramCtrl});
        $routeProvider.when('/local', {templateUrl: 'partials/bestofinstagram.html', controller: RequestUserLocationCtrl});
        $routeProvider.when('/local/:lat/:lng', {templateUrl: 'partials/bestofinstagram.html', controller: LocalInstagramCtrl});
        $routeProvider.when('/about');
        $routeProvider.otherwise({redirectTo: '/bestof'});
    }]);

module.service('SearchState', function(){
    var state = ""
    return {
        getState : function(){
            return state;
        },
        setState: function(value){
            console.log('set State of SearchState');
            state = value;
        }
    }
})

module.controller('MainCtrl', ['$scope', function($scope, SearchState){
    $scope.year = 2013;
    $scope.isActivate = function(state){
        //if(SearchState.getState() == state){
            return 'active';
        //}else{
        //    return '';
        //}
    };

    $scope.showAbout = function(){
        $('#aboutWindow').modal('show')
    }

    $scope.hideAbout = function(){
        $('#aboutWindow').modal('hide')
    }
}]);

function isActivate(path){
    console.log('isActivate', path);
    return 'active';
}
