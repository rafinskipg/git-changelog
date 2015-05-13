'use strict';

var debug = require('debug')('changelog:getStream');
var fs = require('fs');
var path = require('path');
var q = require('q');

function checkPathDone(deferred, filename) {
  deferred.resolve(fs.createWriteStream(filename));
}

function getStream(filename) {
  debug('getting stream ...');
  var deferred = q.defer();
  var stream;

  if (filename) {
    this.checkPath(path.dirname(filename), checkPathDone.bind(null, deferred, filename));
  } else {
    deferred.resolve(process.stdout);
  }

  return deferred.promise;
}

module.exports = getStream;
