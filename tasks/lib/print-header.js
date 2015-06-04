'use strict';

var debug = require('debug')('changelog:printHeader');
var format = require('util').format;
var tpl = 
  '<a name="">Version %s</a>\n\n'+
  '<img width="300px" src="http://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" />\n\n'+
  '__%s %s__\n\n' +
  '_a project by Google Corp_\n\n' +
  '#  v%s (%s)\n\n';

function printHeader(stream, options, date) {

  debug('printing header');
  stream.write('\n\n---\n');
  stream.write(format(tpl, options.version, options.logo, options.app_name, options.version, date));
}

module.exports = printHeader;
