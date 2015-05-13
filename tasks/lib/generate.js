'use strict';

var debug = require('debug')('changelog:generate');
var q = require('q');

function writeChangelogDone(deferred) {
  deferred.resolve(this.options);
}

function writeCommitsToStream(deferred, commits, stream) {
  this.writeChangelog(stream, commits)
    .then(writeChangelogDone.bind(this, deferred));
}

function generateFromCommits(deferred, commits) {
  this.message('parsed commits', commits.length);
  this.log('Parsed', commits.length, 'commits');
  this.log('Generating changelog to', this.options.file || 'stdout', '(', this.options.version, ')');

  this.getStream(this.options.file)
    .then(writeCommitsToStream.bind(this, deferred, commits));
}

function handleReadGitLogError(err) {
  console.log('error', err);
}

function generateFromTag(deferred, tag) {
  var readGitLog;

  if (typeof(tag) !== 'undefined' && tag !== false) {
    this.log('Reading git log since', tag);
    this.message('since tag', tag);
    readGitLog = this.readGitLog.bind(this, this.cmd.gitLog, tag);
  } else {
    this.log('Reading git log since the beggining');
    this.message('since beggining');
    readGitLog = this.readGitLog.bind(this, this.cmd.gitLogNoTag);
  }

  readGitLog()
    .then(generateFromCommits.bind(this, deferred))
    .catch(handleReadGitLogError);
}

function handleGenerateError(deferred, err) {
  console.log('Error generating changelog ', err);
  deferred.reject(err);
}

function generate(params) {
  debug('generating ...');
  var self = this;
  var deferred = q.defer();

  this.init(params)
    .then(this.getPreviousTag.bind(this))
    .then(generateFromTag.bind(this, deferred))
    .catch(handleGenerateError.bind(null, deferred));

  return deferred.promise;
}

module.exports = generate;
