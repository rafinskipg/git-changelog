'use strict';

var debug = require('debug')('changelog:printHeader');
var format = require('util').format;

//Templates
var logoTemplate = '<img width="300px" src="%s" />\n\n';
var titleTemplate = '__%s__\n\n';
var subtitleTemplate = '_%s_\n\n';
var versionTemplate = '# %s %s (%s)\n\n';

function printHeader(stream, options, date) {

  debug('printing header');
  if(options.logo){
    stream.write(format(logoTemplate, options.logo));
  }

  stream.write(format(titleTemplate, options.app_name));

  if(options.intro){
    stream.write(format(subtitleTemplate, options.intro));
  }

  stream.write(format(versionTemplate, options.version || '', options.versionName || '', date));
  stream.write('\n\n---\n');
}

module.exports = printHeader;
