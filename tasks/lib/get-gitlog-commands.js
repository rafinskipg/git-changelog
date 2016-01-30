'use strict';

var debug = require('debug')('changelog:getGitLogCommands');

function getGitLogCommands() {
  debug('getting log commands');
  this.cmd.gitLog = 'git log --grep="%s" -E --format=%s %s..' + (this.options.branch_name ? this.options.branch_name : 'HEAD');
  this.cmd.gitLogNoTag = 'git log ' + this.options.branch_name + ' --grep="%s" -E --format=%s';
}

module.exports = getGitLogCommands;
