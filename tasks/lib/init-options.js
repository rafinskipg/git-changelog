'use strict';

var debug = require('debug')('changelog:initOptions');
var _ = require('lodash');

var defaults = require('../defaults');

function initOptions(params) {
  debug('initializing options');
  this.setDefaults();

  this.options = _.defaults(params, defaults);

  this.options.msg = '';
  this.message('name', this.options.app_name);
  this.message('intro', this.options.intro);
  this.message('file', this.options.file);
  this.message('logo', this.options.logo);
  this.message('sections', this.options.sections);
  this.message('debug', this.options.debug);
  this.message('version', this.options.version);
  this.message('changelogrc', this.options.changelogrc);
}

module.exports = initOptions;
