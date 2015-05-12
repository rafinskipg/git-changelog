'use strict';

var debug = require('debug')('changelog:currentDate');
var format = require('util').format;

function pad(i) {
  return ('0' + i).substr(-2);
}

function currentDate() {
  debug('getting current date');
  var now = new Date();
  return format('%d-%s-%s', now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()));
}

module.exports = currentDate;
