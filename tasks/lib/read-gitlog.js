'use strict';

var debug = require('debug')('changelog:readGitLog');
var format = require('util').format;
var child = require('child_process');
var q = require('q');

function processRawCommit(commits, rawCommit) {
  var commit = this.parseRawCommit(rawCommit);
  if (commit) {
    commits.push(commit);
  }
}

function cmdDone(deferred, code, stdout, stderr) {
  debug('returning from git log command');
  var commits = [];

  stdout
    .split('\n==END==\n')
    .forEach(processRawCommit.bind(this, commits), this);

  deferred.resolve(commits);
}

function gitLogCommand(git_log_command, from) {
  if (git_log_command === this.cmd.gitLog) {
    return format(git_log_command, this.options.grep_commits, '%H%n%s%n%b%n==END==', from);
  } else {
    return format(git_log_command, this.options.grep_commits, '%H%n%s%n%b%n==END==');
  }
}

function readGitLog(git_log_command, from) {
  debug('reading git log ...');
  var deferred = q.defer();

  git_log_command = gitLogCommand.call(this, git_log_command, from);
  this.log('debug', 'Executing : ', git_log_command);
  debug('executing git log command');
  child.exec(git_log_command , {timeout: 1000}, cmdDone.bind(this, deferred));

  return deferred.promise;
}

module.exports = readGitLog;
