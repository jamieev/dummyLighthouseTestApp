const gulp = require('gulp');
const run = require('gulp-run-command').default;
const webserver = require('gulp-webserver');
const http = require('http');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

gulp.task('webserver', function () {
  var stream = gulp.src('app')
    .pipe(webserver({
      livereload: false,
      directoryListing: false,
      open: true,
      middleware: function(req, res, next) {
        if (/_kill_\/?/.test(req.url)) {
          res.end();
          stream.emit('kill');
        }
        next();
      }
    }));
});

gulp.task('webserver-stop', function (cb) {
  http.request('http://localhost:8000/_kill_').on('close', cb).end();
});
