'use strict';

var debug = require('debug')('changelog:generate');

function generateFromCommits(commits, sections) {
  this.message('parsed commits', commits.length);
  this.log('debug', 'Parsed', commits.length, 'commits');
  this.log('info','Generating changelog to', this.options.file || 'stdout', '(', this.options.version, ')');

  return this.writeChangelog(commits, sections);
}

function generateFromTag(tag) {
  var readGitLog;
 
  if (typeof(tag) !== 'undefined' && tag && tag !== false) {
    this.log('info', 'Reading git log since', tag);
    this.message('since tag', tag);
    readGitLog = this.readGitLog.bind(this, this.cmd.gitLog, tag);
  } else {
    this.log('info', 'Reading git log since the beggining');
    this.message('since beggining');
    readGitLog = this.readGitLog.bind(this, this.cmd.gitLogNoTag);
  }

  return readGitLog()
    .then(generateFromCommits.bind(this))
    .catch(console.log.bind(console, 'error'));
}

function generate(params, loadRC) {
  debug('generating ...');
  var self = this;

  return this.init(params, loadRC)
    .then(this.getPreviousTag.bind(this))
    .then(generateFromTag.bind(this))
    .then(function(){
      return self.options;
    })
    .catch(function(err){
      self.log('error', err);
      throw(err);
    });
}

module.exports = generate;
