'use strict';

describe('my app', function() {
  beforeEach(function() {
    browser().navigateTo('../../app/index.html');
  });

  it('test 1', function() {
      expect(element('#hello').text()).toEqual('World!');
  });
});
