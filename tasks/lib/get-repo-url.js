'use strict';

var debug = require('debug')('changelog:getRepoUrl');
var child = require('child_process');
var q = require('q');

function cmdDone(deferred, code, stdout, stderr) {
  debug('returning git repo url command');
  if (code) {
    deferred.reject();
  } else {
    stdout = stdout.replace('\n', '').replace('.git', '');
    deferred.resolve(stdout);
  }
}

function getRepoUrl() {
  debug('getting repo url');
  var deferred = q.defer();

  if (this.options.repo_url) {
    deferred.resolve(this.options.repo_url);
  } else {
    //IF we dont find a previous tag, we get all the commits from the beginning - The bigbang of the code
    debug('calling git repo url command');
    child.exec(this.cmd.gitRepoUrl, cmdDone.bind(null, deferred));
  }

  return deferred.promise;
}

module.exports = getRepoUrl;
