module.exports = function (grunt) {
    'use strict';

    var githubPagesFolder = 'build/';

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
                    {expand: true, flatten: true, src: ['app/css/*.css'], dest: 'build/css/', filter: 'isFile'},
                ]
            },
            gh: {
                files: [
                    {
                        expand: true, flatten: false,
                        cwd: 'build/',
                        src: ['**'],
                        dest: githubPagesFolder
                    }
                ]
            }
        },
        githubPages: {
            target: {
                options: {
                    // The default commit message for the gh-pages branch
                    commitMessage: grunt.option('m') || 'update v' + grunt.file.readJSON('package.json').version
                },
                // The folder where your gh-pages repo is
                src: githubPagesFolder
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-github-pages');

    // Default task(s).
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['requirejs', 'preprocess', 'copy:main']);
    grunt.registerTask('deploy', ['build', 'copy:gh', 'githubPages']);
};