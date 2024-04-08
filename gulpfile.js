const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

gulp.task('compile-bootstrap', function () {
    return gulp.src([
        'node_modules/bootstrap/dist/js/bootstrap.js',
        // Add other Bootstrap JS files if needed
    ])
    .pipe(concat('bootstrap.bundle.js'))
    .pipe(uglify()) // Optional: Minify the compiled file
    .pipe(gulp.dest('public'));
});

// Define a default task
gulp.task('default', gulp.series('compile-bootstrap'));