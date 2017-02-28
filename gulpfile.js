var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');

var jsFiles = require('./DeployA1/js-files');
var jsDest = './dist';

console.log('jsFiles', jsFiles);

gulp.task('scripts', function() {
    return gulp.src(jsFiles.list)
        .pipe(concat('scripts.js'))
        .pipe(minify({ext: { src: '-debug.js', min: '.js' }}))
        .pipe(gulp.dest(jsDest))
    ;
});


gulp.task('default', function() {
    console.log('Hello, gulp');
});
