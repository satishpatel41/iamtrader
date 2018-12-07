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
            out: "app.min.js"
    }))
    .pipe(uglify())
    .pipe(gulp.dest("./dist"));
});

gulp.task("html", function () {
    var tsResult = gulp.src("views/*.html")
    .pipe(gulp.dest('./dist/views/'));
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

gulp.task('default',gulpSequence('script','html','server'));

 