'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglifyjs'),
    insert = require('gulp-insert'),
    packagejson = require('./package.json'),
    header = '/*! events-manager (' + packagejson.version + '). (C) 2014-2015 Xavier Boubert. MIT @license: en.wikipedia.org/wiki/MIT_License */\r\n',
    files = [
      'events-manager.js'
    ];

gulp.task('default', ['build', 'watch']);

gulp.task('build', function() {
  gulp
    .src('events-manager.js')
    .pipe(uglify('events-manager.min.js', {
      outSourceMap: true
    }))
    .pipe(insert.prepend(header))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch(files, ['build']);
});
