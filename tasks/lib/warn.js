'use strict';

var debug = require('debug')('changelog:warn');
var format = require('util').format;

function warn() {
  this.log('WARNING:', format.apply(null, arguments));
}

module.exports = warn;
