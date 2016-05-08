'use strict';

var debug = require('debug')('changelog:generate');
var q = require('q');
var fse = require('fs-extra');

function generateFromCommits(deferred, commits, sections) {
  var stream;

  this.message('parsed commits', commits.length);
  this.log('debug', 'Parsed', commits.length, 'commits');
  this.log('info','Generating changelog to', this.options.file || 'stdout', '(', this.options.version, ')');

  if (this.options.file) {
    stream = fse.createOutputStream(this.options.file);
  } else {
    stream = process.stdout;
  }

  this.writeChangelog(stream, commits, sections)
    .then(deferred.resolve.bind(deferred, this.options));
}

function generateFromTag(deferred, tag) {
  var readGitLog;

  if (typeof(tag) !== 'undefined' && tag !== false) {
    this.log('info', 'Reading git log since', tag);
    this.message('since tag', tag);
    readGitLog = this.readGitLog.bind(this, this.cmd.gitLog, tag);
  } else {
    this.log('info', 'Reading git log since the beggining');
    this.message('since beggining');
    readGitLog = this.readGitLog.bind(this, this.cmd.gitLogNoTag);
  }

  readGitLog()
    .then(generateFromCommits.bind(this, deferred))
    .catch(console.log.bind(console, 'error'));
}

function generate(params, loadRC) {
  debug('generating ...');
  var self = this;
  var deferred = q.defer();

  this.init(params, loadRC)
    .then(this.getPreviousTag.bind(this))
    .then(generateFromTag.bind(this, deferred))
    .catch(function(err){
      self.log('error', err);
      deferred.reject(err);
    });

  return deferred.promise;
}

module.exports = generate;
