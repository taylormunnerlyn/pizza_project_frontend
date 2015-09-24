(function (require, process) {
    'use strict';

    var gulp = require('gulp'),
        historyApiFallback = require('connect-history-api-fallback'),
        watch = require('gulp-watch'),
        gutil = require('gulp-util'),
        del = require('del'),
        bower = require('gulp-bower'),
        vinylPaths = require('vinyl-paths'),
        through = require('through2'),
        jshint = require('gulp-jshint'),
        concat = require('gulp-concat'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        less = require('gulp-less'),
        minifyCSS = require('gulp-minify-css'),
        templateCache = require('gulp-angular-templatecache'),
        template = require('gulp-template'),
        runSequence = require('run-sequence'),
        csslint = require('gulp-csslint'),
        connect = require('gulp-connect'),
        ngConstant = require('gulp-ng-constant'),
        gulpif = require('gulp-if'),
        changed = require('gulp-changed'),
        ngAnnotate = require('gulp-ng-annotate'),
        notify = require('gulp-notify'),
        minifyHTML = require('gulp-minify-html'),
        sourcemaps = require('gulp-sourcemaps'),
        chalk = require('chalk'),
        table = require('text-table'),
        logSymbols = require('log-symbols'),
        stringLength = require('string-length'),
        babel = require('gulp-babel'),
        cssAutoprefixer = require('gulp-autoprefixer'),
        argv = require('yargs').argv,
        karma = require('karma').server,
        config = require('./config.js'),
        computed = require('./src/config/computed.js'),
        env = process.env.NODE_ENV || 'dev',
        compiling = process.argv.indexOf('compile') !== -1,
        cacheBuster = Date.now();

    /**
     * Start the development server on port 9000. Runs from the `bin/` folder if
     * it exists.
     */
    gulp.task('connect', function () {
        var port = parseInt(argv.port) || 9000,
            host = argv.host || 'localhost';
        connect.server({
            root: ['bin', 'build'],
            port: port,
            livereload: true,
            host: host,
            middleware: function () {
                return [historyApiFallback];
            }
        });
        gulp.src(config.appFiles.index)
            .pipe(notify('Server running on http://' + host + ':' + port));
    });

    /**
     * Runs the tests for the app once.
     */
    gulp.task('test', function (done) {
        karma.start({
            configFile: __dirname + '/karma/karma.conf.js',
            singleRun: true
        }, done);
    });

    /**
     * Continuously run the tests when changes occur.
     */
    gulp.task('tdd', function (done) {
        karma.start({
            configFile: __dirname + '/karma/karma.conf.js'
        }, done);
    });

    /**
     * Cleans the build and compile directories.
     */
    gulp.task('clean', function () {
        return gulp.src([config.buildDir, config.compileDir], {read: false})
            .pipe(vinylPaths(del));
    });

    /**
     * Installs Bower Dependencies.
     */
    gulp.task('dependencies', function () {
        return bower();
    });

    /**
     * Lints all of the app .js files and moves them to the build directory.
     *
     * Runs ngAnnotate if compiling.
     */
    gulp.task('buildScripts', function () {
        var scripts = config.appFiles.js;
        if(env === 'dev') {
            scripts = scripts.concat(config.devScripts);
        }
        return gulp.src(scripts)
            .pipe(changed(config.buildDir))
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(sourcemaps.init())
            .pipe(babel(config.babelOptions))
            .on('error', notify.onError('JS Error: <%= error.message %>'))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(config.buildDir))
            .pipe(connect.reload());
    });

    /**
     * Lints all of the less files compiles them into CSS and moves them
     * into the build directory.
     *
     * * NOTE: Works best if you only have one .less file and everything else
     *         is imported from it.
     */
    gulp.task('buildStyles', function () {
        var customCssReporter = function (file) {
            var errCount = 0,
                warnCount = 0,
                msgTable,
                countTable = [];

            var pluralize = function (str, count) {
                return str + (count === 1 ? '' : 's');
            };

            if (file.csslint.success) {
                return false;
            }

            // Log out the file path.
            gutil.log(
                '\n' +
                chalk.underline(file.path)
            );

            // Format each error message.
            msgTable = table(file.csslint.results.map(function (res) {
                var row = [''],
                    isError = res.error.type === 'error';

                if (isError) {
                    errCount++;

                    res.error.message = chalk.red(res.error.message);
                } else {
                    warnCount++;

                    res.error.message = chalk.yellow(res.error.message);
                }

                if (res.error.line && res.error.col) {
                    row.push(chalk.gray('line ' + res.error.line));
                    row.push(chalk.gray('col ' + res.error.col));
                    row.push(res.error.message);
                } else {
                    row.push('');
                    row.push('');
                    row.push(res.error.message);
                }

                if (file.csslint.options.verbose) {
                    row[row.length - 1] += ' (' + res.error.rule.id + ')';
                }

                return row;
            }), {
                stringLength: stringLength
            });

            // Format the warning and error count tables.
            if (errCount > 0) {
                countTable.push([
                    '',
                    logSymbols.error,
                    errCount + pluralize(' error', errCount)
                ]);
            }

            if (warnCount > 0) {
                countTable.push([
                    '',
                    logSymbols.warning,
                    warnCount + pluralize(' warning', warnCount)
                ]);
            }

            // Log out the error message and count tables.
            gutil.log(msgTable);
            gutil.log('\n' + table(countTable));
        };

        return gulp.src(config.appFiles.less)
            .pipe(changed(config.buildDir))
            .pipe(sourcemaps.init())
            .pipe(less())
            .on('error', notify.onError('LESS Error: <%= error.message %>'))
            .pipe(csslint('.csslintrc'))
            .pipe(csslint.reporter(customCssReporter))
            .pipe(cssAutoprefixer(config.cssAutoPrefixerOptions))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(config.buildDir))
            .pipe(connect.reload());
    });

    /**
     * Compiles all of the app HTML template files into a single JS file and
     * moves it into the build directory.
     */
    gulp.task('buildHtml', function () {
        return gulp.src(config.appFiles.tpl)
            .pipe(template({
                env: env
            }))
            .pipe(gulpif(compiling, minifyHTML({empty: true})))
            .pipe(templateCache('templates.js', {
                module: 'htmlTemplates',
                standalone: true
            }))
            .pipe(gulp.dest(config.buildDir))
            .pipe(connect.reload());
    });

    /**
     * Moves all of the app files into the build directory.
     */
    gulp.task('buildAssets', function () {
        return gulp.src(config.appFiles.assets)
            .pipe(gulp.dest(config.buildDir + '/assets'))
            .pipe(connect.reload());
    });

    /**
     * Moves all of the vendor scripts into the build directory maintaining
     * directory structure.
     */
    gulp.task('buildVendorScripts', function () {
        return gulp.src(config.vendor.js)
            .pipe(gulp.dest(config.buildDir + '/vendor'));
    });

    /**
     * Moves all of the vendor CSS files into the build directory maintaining
     * directory structure.
     */
    gulp.task('buildVendorCss', function () {
        if (config.vendor.css.length !== 0) {
            return gulp.src(config.vendor.css)
                .pipe(gulp.dest(config.buildDir + '/vendor'));
        }
    });

    /**
     * Moves all of the vendor assets into the build directory maintaining
     * directory structure.
     */
    gulp.task('buildVendorAssets', function () {
        if (config.vendor.assets.length !== 0) {
            return gulp.src(config.vendor.assets)
                .pipe(gulp.dest(config.buildDir + '/vendor'));
        }
    });

    /**
     * Grab all of the scripts and concatenate them into one file, also minify
     * that file into another file.
     */
    gulp.task('compileScripts', function () {
        var files = config.index.scripts.map(function(script) {
            return config.buildDir + '/' + script;
        });

        files.push(config.buildDir + '/' + 'app/**/*.js');
        files.push(config.buildDir + '/' + 'common/**/*.js');

        return gulp.src(files, {}, {nosort: true})
            .pipe(ngAnnotate())
            .pipe(concat('app.' + cacheBuster + '.min.js'))
            .pipe(uglify({mangle: false}))
            .pipe(gulp.dest(config.compileDir));
    });

    /**
     * Moves the main.css file to the compile directory. Also minifies the css
     * into main.min.css.
     */
    gulp.task('compileStyles', function () {
        return gulp.src(config.index.styles, {cwd: 'build'})
            .pipe(concat('main.' + cacheBuster + '.min.css'))
            .pipe(minifyCSS({
                keepSpecialComments: 0
            }))
            .pipe(gulp.dest(config.compileDir));
    });

    /**
     * Moves all of the assets to the compile directory.
     */
    gulp.task('compileAssets', function () {
        var assets = config.vendor.assets;

        assets.push(config.buildDir + '/assets/**');

        return gulp.src(assets)
            .pipe(gulp.dest(config.compileDir + '/assets'));
    });

    /**
     * Sets up the configuration constants depending on the environment type.
     */
    gulp.task('config', function () {
        gulp.src('src/config/' + env + '.json')
            .pipe(through.obj(function (file, enc, cb) {
                try {
                    var config = JSON.parse(file.contents).config;
                    config.env = env;
                    file.contents = new Buffer(
                        JSON.stringify({config: computed(config)})
                    );
                    cb(null, file);
                } catch (err) {
                    cb(new gutil.PluginError(
                        'config',
                        'Error computing config',
                        {showStack: true}
                    ), file);
                }
            }))
            .pipe(ngConstant({
                name: 'config'
            }))
            .pipe(rename({
                basename: 'config'
            }))
            .pipe(gulp.dest(config.buildDir))
            .pipe(connect.reload());
    });

    gulp.task('rootFiles', function () {
        return gulp.src(config.rootFiles)
            .pipe(gulpif(
                compiling,
                gulp.dest(config.compileDir),
                gulp.dest(config.buildDir)
            ));
    });

    /**
     * Find all of the .js and .css files that need to be included in the
     * index.html file.
     */
    gulp.task('index', function () {
        var scripts = config.index.scripts;
        var styles = config.index.styles;

        // Override the styles if compiling.
        if (compiling) {
            scripts = ['app.' + cacheBuster + '.min.js'];
            styles = ['main.' + cacheBuster + '.min.css'];
        }

        if (env === 'dev') {
            scripts = scripts.concat(config.devScripts);
        }

        return gulp.src(config.appFiles.index)
            .pipe(template({
                scripts: scripts,
                styles: styles,
                env: env,
                compile: compiling
            }))
            .pipe(gulpif(compiling, minifyHTML({empty: true})))
            .pipe(gulpif(
                compiling,
                gulp.dest(config.compileDir),
                gulp.dest(config.buildDir)
            ))
            .pipe(connect.reload());
    });

    /**
     * Watch the app files for any changes and perform the necessary actions
     * when a change does occur.
     */
    gulp.task('watch', function () {
        watch(config.appFiles.delta.js, function () {
            gulp.start(['buildScripts']);
        });
        watch(config.appFiles.tpl, function () {
            gulp.start(['buildHtml']);
        });
        watch(config.appFiles.delta.less, function () {
            gulp.start(['buildStyles']);
        });
        watch(config.appFiles.index, function () {
            gulp.start(['index']);
        });
        watch(config.appFiles.assets, function () {
            gulp.start(['buildAssets']);
        });
        watch(['src/config/*', './config.js'], function () {
            delete require.cache[require.resolve('./config.js')];
            config = require('./config.js');
            delete require.cache[require.resolve('./src/config/computed.js')];
            computed = require('./src/config/computed.js');
            gulp.start(['buildApp', 'index']);
        });
    });

    gulp.task('buildApp', [
        'buildScripts', 'buildStyles', 'buildHtml', 'buildAssets', 'config',
        'buildVendorScripts', 'buildVendorCss', 'buildVendorAssets', 'rootFiles'
    ]);

    gulp.task('compileApp', [
        'compileScripts', 'compileStyles', 'compileAssets'
    ]);

    gulp.task('build', function (callback) {
        // Ensure clean is run and finished before everything else.
        runSequence(
            'clean',
            'dependencies',
            ['buildApp'],
            'index',
            'watch',
            'connect',
            callback
        );
    });

    gulp.task('compile', function (callback) {
        runSequence(
            'clean',
            'dependencies',
            'buildApp',
            ['compileApp'],
            'index',
            callback
        );
    });

    gulp.task('server', ['connect']);

    gulp.task('default', ['compile']);
}(require, process));
