const gulp = require('gulp');
const run = require('gulp-run-command').default;
const webserver = require('gulp-webserver');
const http = require('http');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

gulp.task('webserver', function() {
  gulp.src('app')
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});
