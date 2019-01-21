var gulp = require("gulp");
var server = require('gulp-express');
var ts = require("gulp-typescript");
var uglify = require('gulp-terser');
var rename = require('gulp-rename');
const concat = require('gulp-concat');
var exec    = require('child_process').exec;
const minify = require("gulp-babel-minify");
var del = require('del');
var gulpSequence = require('gulp-sequence').use(gulp);

/* gulp.task('connect', function() {
    connect.server();
  });
  */
  

 gulp.task("script", () =>
    gulp.src("src/*.js")
    .pipe(minify({
        mangle: {
        keepClassName: true
        }
    })) 
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest("./dist"))
);
  /*   
gulp.task("script", function () {
    var tsResult = gulp.src("src/*.js")
    .pipe(ts({
            noImplicitAny: false,
            lib: ["es2015","dom"],
            target: "es5",
            noImplicitAny:false,
            sourceMap:false,
            out: "app.min.js"
    }))
    //.pipe(uglify())
    //.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest("./dist"));
}); */
/* gulp.task("script", function () {
    var script =  gulp.src('src/*.js')
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .on('error', function (err) { console.log(err.toString()); })
    .pipe(gulp.dest('dist'));
});  */
gulp.task("html", function () {
    var tsResult = gulp.src("views/*.html")
    .pipe(gulp.dest('./dist/'));
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

/* gulp.task('server', function() {
    connect.server({
      root: 'dist/app.min.js',
      livereload: true
    });
  }); */

gulp.task('clean', function () {
    return del([
        'dist'
    ]);
});
gulp.task('build',gulpSequence('script','html'));
gulp.task('default',gulpSequence('clean','build','server'));
gulp.task('release',gulpSequence('clean','script','html'));

 