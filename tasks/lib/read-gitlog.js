'use strict';

const { format, promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const log = require('./log');
const debug = require('debug')('changelog:readGitLog');

function cmdDone(stdout, stderr) {
  debug('returning from git log command');

  if(!!stderr) {
    log.call(this, 'error', 'Error reading gitlog', stderr);
  }

  return stdout
    .split('\n==END==\n')
    .reduce((commits, rawCommit) => {
      const commit = this.parseRawCommit(rawCommit, this.options.commit_body);

      if (commit) {
        commits.push(commit);
      }

      return commits;
    }, []);
}

function gitLogCommand(git_log_command, from) {
  const { cmd, options } = this || {};

  if (git_log_command === cmd.gitLog) {
    return format(git_log_command, options.grep_commits, '%H%n%s%n%b%n==END==', from);
  } else {
    return format(git_log_command, options.grep_commits, '%H%n%s%n%b%n==END==');
  }
}

function readGitLog(git_log_command, from) {
  debug('reading git log ...');

  git_log_command = gitLogCommand.call(this, git_log_command, from);
  
  log.call(this, 'debug', 'Executing : ', git_log_command);
  debug('executing git log command');
  
  return execAsync(git_log_command , {timeout: 1000})
    .then(({stdout, stderr}) => cmdDone.call(this, stdout, stderr));
}

module.exports = readGitLog;
