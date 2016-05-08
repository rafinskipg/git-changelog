'use strict';

var debug = require('debug')('changelog:getPreviousTag');
var child = require('child_process');
var q = require('q');

function cmdDone(deferred, code, stdout, stderr) {
  debug('returning from git tag');
  if (code) {
    deferred.reject();
  } else {
    deferred.resolve(stdout.replace('\n', ''));
  }
}

function getPreviousTag() {
  var deferred = q.defer();

  if (this.options.tag) {
    deferred.resolve(this.options.tag);
  } else if (this.options.tag === false) {
    deferred.resolve(false);
  } else {
    this.log('debug', 'Getting last tag');
    //IF we dont find a previous tag, we get all the commits from the beggining - The bigbang of the code
    debug('calling git tag command');
    child.exec(this.cmd.gitTag, cmdDone.bind(null, deferred));
  }

  return deferred.promise;
}

module.exports = getPreviousTag;
