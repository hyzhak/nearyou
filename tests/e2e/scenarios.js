'use strict';

describe('my app', function() {
    beforeEach(function() {
        browser().navigateTo('../../app/index.html');
    });

    it('should automatically redirect to /bestof when location hash/fragment is empty', function() {
        expect(browser().location().url()).toBe("/bestof");
    });

    describe('bestof', function() {

        beforeEach(function() {
            browser().navigateTo('#/bestof');
        });


        it('should render view1 when user navigates to /view1', function() {
            expect(element('[ng-view] p:first').text()).
                toMatch(/partial for view 1/);
        });

    });
});
