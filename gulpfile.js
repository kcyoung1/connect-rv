var gulp = require('gulp');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var cssnano = require('gulp-cssnano');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel')

// Development Tasks
// -----------------

// Start browserSync Server
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './app/'
    },
  })
});

// Autoprefixer
gulp.task('autoprefixer', function() {
  return gulp.src('./app/src/css/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./app/src/css'))
});

// Sass Compiler
gulp.task('sass', function() {
    return gulp.src('./app/scss/**/*.scss')
      .pipe(sassGlob())
      .pipe(sass()) // Use gulp-sass
      .pipe(gulp.dest('./app/src/css'))
      .pipe(browserSync.reload({
        stream: true
      }));
});

// Babel ES6
gulp.task('babel', function() {
  return gulp.src('./app/src/js/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./app/src/js'))
});

// Watch
gulp.task('watch', function() {
  gulp.watch('./app/scss/**/*.scss', ['sass']);
  gulp.watch('./app/template/**/*.html', browserSync.reload);
  gulp.watch('./app/*.html', browserSync.reload);
  gulp.watch('./app/src/js/**/*.js', browserSync.reload);
});


// Optimation Tasks
// ----------------

// Optimizing CSS and JavaScript
gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    // Minifies only if it is a JS file
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

// Images
gulp.task('images', function() {
  return gulp.src('./app/assets/images/**/*.+(png|jpg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin([imagemin.gifsicle(), imagemin.jpegtran(), imagemin.optipng(), imagemin.svgo()], {
      interlaced: true
    })))
    .pipe(gulp.dest('./public/assets/images'))
});

// Fonts
gulp.task('fonts', function() {
  return gulp.src('./app/assets/fonts/**/*')
    .pipe(gulp.dest('./public/assets/fonts'))
});

// Cleaning
gulp.task('clean:public', function() {
  return del.sync('public')
});

gulp.task('cache:clear', function(callback) {
  return cache.clearAll(callback)
});


// Build Sequences
// ---------------

gulp.task('build', function(callback) {
  runSequence('clean:public', 'autoprefixer', ['sass', 'babel'], ['useref', 'images', 'fonts'],
    callback
    )
});

gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
    )
});
