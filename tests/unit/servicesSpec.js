define(['app/google/analytics'], function(GoogleAnalytics) {
    //'use strict';
    //don't use because we're going to mock googleAnalytics global function

    /* jasmine specs for services go here */
    describe('GoogleAnalytics', function() {

        var ID_MOCK = 'xxx',
            googleAnalyticsService;

        beforeEach(inject(function($window) {
            googleAnalyticsService = new GoogleAnalytics(ID_MOCK, $window);
        }));

        it('should track page', function(){
            googleAnalytics = sinon.spy();
            googleAnalyticsService.trackPage();
            expect(googleAnalytics).toHaveBeenCalled();
        });
    });
});

