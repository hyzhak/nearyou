'use strict';

/* jasmine specs for services go here */

describe('service', function() {
    beforeEach(module('myApp.services'));

    describe('version', function() {
        it('should return current version', inject(function(version) {
            expect(version).toEqual('0.0.1');
        }));
    });

    describe('instagram clientId', function(){
        it('should return not null value', inject(function(instagramClintId){
            expect(instagramClintId).not.toEqual(null);
        }));
    })
});
