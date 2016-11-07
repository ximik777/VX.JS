function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

module.exports = function (grunt) {
    'use strict';

    var build = [
        "core",
         "events",
         "dom",
         "ajax",
         "langs",
         "cookie",
         "cc",
         "buttons",
         "boxes",
        // "tooltips",
         "selectors",
         "indexer",
         "cache",
         "checkboxes",
         "radiobuttons",
         "dropdownMenu",
         "inlineEdit",
         "autosize",
         "calendar",
         "datepicker",
         "timepicker",
         "daypicker",
        // "slider",
        // "trackControl",
        // "audioPlayer",
        // "qSearch2"
    ];

    var tree = grunt.file.readJSON('tree.json');
    var list = {
        js: [],
        css: [],
        swf: [],
        images: [],
        html: []
    }, module_list = [], modules = [];

    for (var i in build) {

        if (!tree[build[i]]) {
            console.log("VX Module '" + build[i] + "' not found");
            return;
        }

        module_list.push(build[i]);
        module_list = module_list.concat(tree[build[i]].dependencies);

    }

    module_list = module_list.filter(onlyUnique);

    for (var i in module_list) {
        modules.push(tree[module_list[i]]);
    }

    modules = modules.sort(function (a, b) {
        if (a.sort < b.sort)
            return -1;
        if (a.sort > b.sort)
            return 1;
        return 0;
    });

    for(var i in modules){
        list.js = list.js.concat(modules[i].js || []);
        list.css = list.css.concat(modules[i].css || []);
        list.images = list.images.concat(modules[i].images || []);
        list.swf = list.swf.concat(modules[i].swf || []);
        list.html = list.html.concat(modules[i].example || []);
    }

    list.js = list.js.filter(onlyUnique);
    list.css = list.css.filter(onlyUnique);
    list.images = list.images.filter(onlyUnique);
    list.swf = list.swf.filter(onlyUnique);
    list.html = list.html.filter(onlyUnique);

    var mkdirp = require('mkdirp');
    mkdirp('bower_components', function (err) {
        console.log(err);
    });

    grunt.util.linefeed = '\n';

    // Time how long tasks take
    require('time-grunt')(grunt);

    //Automatically load required grunt tasks
    require('jit-grunt')(grunt, {
        htmllint: 'grunt-html'
    });

    // Bower dependencies
    var dependencies = require('wiredep')();

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Validate JS files with ESLint
        eslint: {
            target: list.js
            // target: [
            //     'Gruntfile.js',
            //     'js/**/*.js'
            // ]
        },
        // Compile ES6 with Babel
        babel: {
            options: {
                presets: ['es2015']
            },
            dist: {
                files: [{
                    cwd: 'js',
                    dest: 'dist/js',
                    dot: true,
                    expand: true,
                    ext: '.js',
                    extDot: 'last',
                    //src: list.js
                    src: [
                        '**/*.js'
                    ]
                }]
            }
        },

        // Concatenate JS files
        concat: {
            dist: {
                files: {
                    'dist/js/<%= pkg.name %>.js': list.js,
                    'dist/css/<%= pkg.name %>.css': list.css
                }
            }
        },

        // Minify JS files
        uglify: {
            options: {
                compress: {
                    warnings: false
                },
                mangle: true,
                preserveComments: /^!|@preserve|@license|@cc_on/i
            },
            dist: {
                files: [{
                    cwd: 'dist/js',
                    dest: 'dist/js',
                    expand: true,
                    ext: '.min.js',
                    extDot: 'last',
                    src: [
                        '**/*.js',
                        '!**/*.min.js'
                    ]
                }]
            }
        },

        // Import bower components into the vendor.scss file
        wiredep: {
            sass: {
                src: ['scss/vendor.scss'],
                ignorePath: /^(\.\.\/)+/
            }
        },

        // Compile Sass to CSS
        sass: {
            options: {
                includePaths: ['scss/'],
                outputStyle: 'expanded',
                precision: 6,
                sourceComments: false,
                sourceMap: false
            },
            dist: {
                files: [{
                    cwd: 'scss',
                    dest: 'dist/css',
                    expand: true,
                    ext: '.css',
                    src: '**/*.scss'
                }]
            }
        },

        // Transform CSS
        postcss: {
            options: {
                map: false,
                processors: [
                    // Inline @import rules content
                    require('postcss-import')({
                        path: '.'
                    }),

                    // Inline SVG and customize its styles
                    require('postcss-inline-svg')({
                        path: 'img'
                    }),

                    // Add vendor prefixed styles
                    require('autoprefixer')({
                        browsers: [
                            'Chrome >= 35',
                            'Edge >= 12',
                            'Explorer >= 9',
                            'iOS >= 8',
                            'Safari >= 8',
                            'Android 2.3',
                            'Android >= 4',
                            'Opera >= 12'
                        ]
                    }),

                    // Fix Bootstrap crazy things e.g ($panel-border-radius - 1)
                    function (css) {
                        css.walkDecls(/radius/, function (decl) {
                            if ((/-1/g).test(decl.value)) {
                                decl.value = 0;
                            }
                        });
                    }
                ]
            },
            dist: {
                files: [{
                    cwd: 'dist/css',
                    dest: 'dist/css',
                    expand: true,
                    src: '**/*.css'
                }]
            }
        },

        // Compress CSS files
        cssmin: {
            options: {
                advanced: false,
                compatibility: 'ie9',
                keepSpecialComments: '*',
                sourceMap: false
            },
            dist: {
                files: [{
                    cwd: 'dist/css',
                    dest: 'dist/css',
                    expand: true,
                    ext: '.min.css',
                    src: [
                        '**/*.css',
                        '!**/*.min.css'
                    ]
                }]
            }
        },

        // Minify images
        imagemin: {
            dist: {
                files: [{
                    cwd: 'dist/images',
                    dest: 'dist/images',
                    expand: true,
                    src: '**/*.{gif,jpeg,jpg,png}'
                }]
            }
        },

        // Minify SVG files
        svgmin: {
            dist: {
                files: [{
                    cwd: 'dist/images',
                    dest: 'dist/images',
                    expand: true,
                    src: '**/*.svg'
                }]
            }
        },

        // Process html files at build time
        processhtml: {
            dist: {
                files: [{
                    cwd: 'dist',
                    dest: 'dist',
                    expand: true,
                    src: '**/*.html'
                }]
            }
        },

        // Minify HTML files
        htmlmin: {
            options: {
                collapseWhitespace: false,
                preserveLineBreaks: true,
                removeComments: true,
                removeEmptyAttributes: true
            },
            dist: {
                files: [{
                    cwd: 'dist',
                    dest: 'dist',
                    expand: true,
                    src: '**/*.html'
                }]
            }
        },

        // Validate HTML files
        htmllint: {
            dist: {
                files: [{
                    cwd: 'dist',
                    dest: 'dist',
                    expand: true,
                    src: [
                        '**/*.html'
                    ]
                }]
            }
        },

        // Format HTML files
        prettify: {
            options: {
                indent: 2,
                unformatted: [
                    'a',
                    'code',
                    'pre',
                    'script'
                ]
            },
            dist: {
                files: [{
                    cwd: 'dist',
                    dest: 'dist',
                    expand: true,
                    src: '**/*.html'
                }]
            }
        },

        // Delete all files and folders
        clean: {
            dist: 'dist/*'
        },

        // Copy required files
        copy: {
            dist: {
                files: [{
                    cwd: '.',
                    dest: 'dist',
                    expand: true,
                    // src: [
                    //     '*.html',
                    //     '*.{ico,png,svg,txt}',
                    //     'manifest.json',
                    //     'browserconfig.xml',
                    //     'fonts/**/*.*',
                    //     'images/**/*.*'
                    // ]
                    src: [list.images] // , 'example/*.html'
                }]
            }
        },

        // Compress files and folders
        compress: {
            sprite: {
                options: {
                    level: 9,
                    mode: 'gzip'
                },
                files: [{
                    expand: true,
                    src: ['dist/images/sprite.svg'],
                    ext: '.svgz'
                }]
            },
            main: {
                options: {
                    archive: '<%= pkg.name %>-<%= pkg.version %>.zip',
                    level: 9,
                    mode: 'zip',
                    pretty: true
                },
                files: [{
                    cwd: 'dist/',
                    dest: '.',
                    expand: true,
                    src: ['**']
                }]
            }
        },


        // Keeping multiple browsers in sync
        browserSync: {
            livereload: {
                options: {
                    files: [
                        '**/*.html',
                        'dist/css/**/*.css',
                        'dist/js/**/*.js'
                    ],
                    notify: false,
                    port: 9000,
                    watchTask: true,
                    server: {
                        baseDir: ['.', 'dist']
                    }
                }
            }
        },

        // Compile modified files only
        newer: {
            options: {
                override: function (details, include) {
                    include(true);
                }
            }
        },

        // Run tasks whenever watched files change
        watch: {
            options: {
                nospawn: true
            },
            babel: {
                files: ['js/**/*.js'],
                tasks: ['newer:babel']
            },
            sass: {
                files: ['scss/**/*.scss'],
                tasks: ['newer:sass', 'newer:postcss']
            }
        }
    });

    grunt.registerTask('server', [
        'clean',
        'babel',
        'concat',
        'wiredep',
        'sass',
        'postcss',
        'browserSync',
        'watch'
    ]);

    grunt.registerTask('build', [
        'clean',
        //'babel',
        'concat',
        'uglify',
        //'wiredep',
        //'sass',
        'postcss',
        'cssmin',
        'copy',
        'imagemin',
        'svgmin',
        //'processhtml',
        //'htmlmin',
        //'prettify',
        //'htmllint',
        //'compress'
    ]);

};
