module.exports = function (grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    baseUrl: "app",
                    mainConfigFile: "app/js/config.js",
                    out: "build/js/<%= pkg.shortName %>.js"
                }
            }
        },
        preprocess : {
            options: {
                context : {
                    DEBUG: false
                }
            },
            html : {
                src : 'app/index.html',
                dest : 'build/index.html'
            }
        },
        copy: {
            main: {
                files: [
//                    {expand: true, src: ['path/*'], dest: 'dest/', filter: 'isFile'},
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-preprocess');

    // Default task(s).
    grunt.registerTask('default', ['requirejs', 'preprocess', 'copy']);
};