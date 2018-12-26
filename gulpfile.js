var gulp = require("gulp");
var server = require('gulp-express');
var ts = require("gulp-typescript");
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');
var gulpSequence = require('gulp-sequence').use(gulp);

gulp.task("script", function () {
    var tsResult = gulp.src("src/*.ts")
    .pipe(ts({
            noImplicitAny: false,
            lib: ["es2015","dom"],
            target: "es5",
            noImplicitAny:false,
            sourceMap:false,
            out: "app.min.js"
    }))
    .pipe(uglify())
    .pipe(gulp.dest("./dist"));
});

gulp.task("html", function () {
    var tsResult = gulp.src("views/*.html")
    .pipe(gulp.dest('./dist/views/'));
});

gulp.task("stockData", function () {
    var tsResult = gulp.src("data/*.csv")
    .pipe(gulp.dest('./dist/data/'));
});
 
gulp.task('server', function () {
    server.run(['dist/app.min.js']);
    gulp.watch(['app/**/*.html'], server.notify);
    gulp.watch(['app/styles/**/*.scss'], ['styles:scss']);
    gulp.watch(['{.tmp,app}/styles/**/*.css'], function(event){
        gulp.run('styles:css');
        server.notify(event);
    });
    gulp.watch(['app/scripts/**/*.js'], ['jshint']);
    gulp.watch(['app/images/**/*'], server.notify);
    gulp.watch(['app.min.js', 'routes/**/*.js'], [server.run]);
});

gulp.task('clean', function () {
    return del([
        'dist'
    ]);
});
gulp.task('build',gulpSequence('script','html'));
gulp.task('default',gulpSequence('build',['server']));
gulp.task('release',gulpSequence('clean','script','html'));

 