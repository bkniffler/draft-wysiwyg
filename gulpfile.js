var gulp = require('gulp');

gulp.task("build", function (callback) {
   global.DEBUG = false;

   require('wrappack/gulpfile')(
      require('./example/config.js')(), callback
   );
});
