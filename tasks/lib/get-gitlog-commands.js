'use strict';

var debug = require('debug')('changelog:getGitLogCommands');

function getGitLogCommands() {
  debug('getting log commands');
  this.cmd.gitLog = 'git log --grep="%s" -i -E --format=%s %s..' + (this.options.branch ? this.options.branch : 'HEAD');
  this.cmd.gitLogNoTag = 'git log ' + this.options.branch + ' --grep="%s" -i -E --format=%s';
}

module.exports = getGitLogCommands;
