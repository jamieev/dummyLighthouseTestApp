const gulp = require('gulp');
const run = require('gulp-run-command').default;
const webserver = require('gulp-webserver');
const http = require('http');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

let config = {
  min_scores: {
    performance: 50,
    accessibility: 50
  }
};

gulp.task('startServer', function () {
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

gulp.task('lighthouse', ['startServer'], function (cb) {
  chromeLauncher.launch({chromeFlags: ['--headless']}).then(function (chrome) {
    lighthouse(
      `http://localhost:8000`,
      {port: chrome.port},// available options - https://github.com/GoogleChrome/lighthouse/#cli-options
      {
        "extends": "lighthouse:default",
        "settings": {
          "onlyCategories": ["performance", "accessibility"]
        }
      }
    ).then(function (results) {
      chrome.kill().then(function () {
        var errors = [];
        results.reportCategories.forEach(cat => {
          console.log(cat.id, cat.score, `(${config.min_scores[cat.id]})`, cat.score > config.min_scores[cat.id]);
          if (config.min_scores[cat.id] && cat.score < config.min_scores[cat.id]) {
            errors.push(`Failure: Score for ${cat.id} (${cat.score}) is under the allowed score`);
          }
        });
        //output the html report using lighthouse's cli printer
        require('./node_modules/lighthouse/lighthouse-cli/printer').write(results, 'html', 'lighthouse-report.html');
        if (errors.length) {
          cb(errors);
        } else {
          cb();
        }
        gulp.start('stopServer');
      })
    }).catch(function (e) {
      cb(e);
      gulp.start('stopServer');
    });
  });
});
gulp.task('stopServer', function (cb) {
  http.request('http://localhost:8000/_kill_').on('close', cb).end();
});
