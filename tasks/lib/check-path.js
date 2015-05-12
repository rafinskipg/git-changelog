'use strict';

var debug = require('debug')('changelog:checkPath');
var fs = require('fs');
var path = require('path');

function makePathDone(done, err) {
  if (err) {
    throw err;
  }
  done();
}

function makePath(dirname, done, err) {
  if (err) {
    throw err;
  } else {
    fs.mkdir(dirname, makePathDone.bind(null, done));
  }
}

function processPath(dirname, done, err, stats) {
  if (err) {
    if (err.code === 'ENOENT') {
      this.checkPath(path.dirname(dirname), makePath.bind(null, dirname, done));
    } else {
      throw err;
    }
  } else if (stats.isDirectory()) {
    done();
  } else {
    throw new Error(dirname + ' exists and is not a directory');
  }
}

function checkPath(dirname, done) {
  fs.stat(dirname, processPath.bind(this, dirname, done));
}

module.exports = checkPath;
