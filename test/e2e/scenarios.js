'use strict';

describe('my app', function() {
    beforeEach(function() {
        browser().navigateTo('../../app/index.html');
    });

    it('should automatically redirect to /bestof when location hash/fragment is empty', function() {
        expect(browser().location().url()).toBe("/bestof");
    });

  it('test 1', function() {

      //expect(element('#hello').text()).toEqual('World!');
  });
});
