'use strict';

var debug = require('debug')('changelog:message');

function message() {
  debug('adding message');
  Array.prototype.slice.call(arguments).forEach(function(value, index) {
    this.options.msg += (index ? ': ' : '') + value;
  }, this);

  this.options.msg += ';';
}

module.exports = message;
