'use strict';

var debug = require('debug')('changelog:log');

function log() {
  if (this.options.debug) {
    console.log.apply(null, arguments);
  }
}

module.exports = log;
