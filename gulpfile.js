// generated on 2015-07-22 using generator-gulp-webapp 1.0.3
var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    browserSync = require('browser-sync'),
    del = require('del'),
    wiredep = require('wiredep').stream;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});
const testLintOptions = {
    env: {
        mocha: true
    }
};

gulp.task('styles', function() {
    return gulp.src('app/styles/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        })
        .on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['last 1 version']}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(reload({stream: true}));
});

function lint(files, options) {
    return function() {
        return gulp.src(files)
            .pipe(reload({stream: true, once: true}))
            .pipe($.eslint(options))
            .pipe($.eslint.format())
            .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
    };
}


gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles'], function() {

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
        .pipe(gulp.dest('dist'));
});

gulp.task('html-dev', ['styles'], function() {

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
    return gulp.src('app/images/**/*')
        .pipe($.if($.if.isFile, $.cache($.imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{cleanupIDs: false}]
        }))
        .on('error', function (err) {
            console.log(err);
            this.end();
        })))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
    return gulp.src(require('main-bower-files')({
        filter: '**/*.{eot,svg,ttf,woff,woff2}'
        })
        .concat('app/fonts/**/*'))
        .pipe(gulp.dest('.tmp/fonts'))
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function() {
    return gulp.src([
        'app/*.*',
        '!app/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'fonts'], function() {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['.tmp', 'app'],
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    '.tmp/fonts/**/*',
    'app/styles/**/*.scss',
    'app/fonts/**/*',
    'bower.json'
    ], ['styles', 'fonts']).on('change', reload);
});

gulp.task('serve:dist', function() {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist']
        }
    });
});

gulp.task('serve:test', function() {
    browserSync({
        notify: false,
        port: 9000,
        ui: false,
        server: {
            baseDir: 'test',
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch('test/spec/**/*.js').on('change', reload);
    gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', function() {
    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
        ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
        ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('build-dev', ['lint', 'html-dev', 'images', 'fonts', 'extras'], function() {
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});


gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], function() {
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});
