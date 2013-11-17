// Karma configuration
// Generated on Sat Nov 16 2013 02:21:58 GMT+0100 (Центральноевропейский (зима))

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../../',


    // frameworks to use
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      {pattern: 'app/js/**/*.js', included: false},
      {pattern: 'tests/unit/**/*Spec.js', included: false},
      { pattern: 'app/lib/angular/angular.js' },
      { pattern: 'app/lib/angular-resource/angular-resource.js' },
      { pattern: 'app/lib/angular-mocks/angular-mocks.js' },
      'app/lib/sinonjs/sinon.js',
      'app/lib/jasmine-sinon/lib/jasmine-sinon.js',
      'tests/unit/test-main.js'
    ],


    // list of files to exclude
    exclude: [
        'tests/config/karma.conf.js', 'app/js/main.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
