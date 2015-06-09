'use strict';
var colors = require('colors');
var debug = require('debug')('changelog:log');

function log() {
  if (this.options.debug) {
    console.log(colors.blue.apply(null, arguments));
  }
}

module.exports = log;
