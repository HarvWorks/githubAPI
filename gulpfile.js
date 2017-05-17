let gulp = require('gulp');
let gutil = require('gulp-util');
let bower = require('bower');
let concat = require('gulp-concat');
let sass = require('gulp-sass');
let minifyCss = require('gulp-minify-css');
let rename = require('gulp-rename');
let sh = require('shelljs');
let babel = require('gulp-babel');

let paths = {
    sass: ['./scss/**/*.scss'],
    js: ['./www/app/**/*.js', './www/dist/**/*.js']
};

gulp.task('default', ['sass', 'babel']);

gulp.task('serve:before', ['default', 'watch'], () => {});

gulp.task('sass', function (done) {
    gulp.src('./scss/app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
        keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('babel', function () {
    console.log('running babel transpile');
    return gulp.src([
        './www/app/**/**.js'
    ])
        .pipe(babel())
        .pipe(concat('all.js'))
        .pipe(gulp.dest('www/all-js/'))
        .on('error', gutil.log);
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.js, ['babel']);
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
    .on('log', function (data) {
        gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
        process.exit(1);
    }
    done();
});
